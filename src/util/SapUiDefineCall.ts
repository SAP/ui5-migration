/* tslint:disable:no-console */

import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {TNodePath} from "ui5-migration";

import {ConsoleReporter} from "../Migration";
import {Reporter, ReportLevel} from "../reporter/Reporter";

import * as SapUiDefineCallUtils from "./SapUiDefineCallUtils";

const builders = recast.types.builders;

interface ShortCut {
	local: string;
	module: object;
	globalName: string;
	stmt: object;
	decl: object;
}

/**
 * SAP UI Define Call, sap.ui.define
 */
export class SapUiDefineCall {
	node: ESTree.CallExpression;
	name: string;
	dependencyArray: ESTree.ArrayExpression;
	dependencyInsertionIdx: number;
	factory: ESTree.FunctionExpression;
	paramNames: string[];
	private shortcuts: ShortCut[];
	exportName: string;
	private classDefinitions: {};
	private globalExportRequired: boolean;

	/**
	 * whether or not global export parameter is set to true in sap.ui.define
	 * call
	 */
	exportToGlobal: boolean;
	private bExportsNode: ESTree.Expression;
	private invalidExportNode: string;
	private reporter: Reporter = new ConsoleReporter(ReportLevel.INFO);

	static isValid(node: ESTree.Node): boolean {
		if (
			node &&
			node.type === Syntax.CallExpression &&
			node.callee.type === Syntax.MemberExpression &&
			node.callee.object.type === Syntax.MemberExpression &&
			node.callee.object.object.type === Syntax.Identifier &&
			node.callee.object.object.name === "sap" &&
			node.callee.object.property.type === Syntax.Identifier &&
			node.callee.object.property.name === "ui" &&
			node.callee.property.type === Syntax.Identifier &&
			node.arguments.length > 0
		) {
			if (node.callee.property.name === "define") {
				// define call might have a literal as optional first argument
				return true;
			} else if (
				node.callee.property.name === "require" &&
				node.arguments[0] &&
				node.arguments[0].type === Syntax.ArrayExpression
			) {
				// require call must have an array (dependencies) as first
				// argument
				return true;
			}
		}
		return false;
	}

	static isValidRootPath(path: TNodePath<ESTree.CallExpression>): boolean {
		/* checks for this structure
		 * Program
		 *   body: Node[]
		 *     0: ExpressionStatement
		 *       expression: SapUiDefineCall
		 */
		return (
			SapUiDefineCall.isValid(path.value) &&
			path.parentPath &&
			path.parentPath.value.type === Syntax.ExpressionStatement &&
			path.parentPath.parentPath &&
			path.parentPath.parentPath.parentPath &&
			path.parentPath.parentPath.parentPath.value.type === Syntax.Program
		);
	}

	constructor(
		node: ESTree.CallExpression,
		moduleName: string,
		reporter: Reporter = new ConsoleReporter(ReportLevel.INFO)
	) {
		this.node = node;
		this.name = moduleName;
		this.reporter = reporter;
		this.dependencyArray = null;

		/**
		 * can be checked if the to determine if the sap.ui.define call is
		 * usable for the tasks
		 */
		this.factory = null;

		this.bExportsNode = null;
		this.exportToGlobal = false;
		this.exportName = null;
		this.globalExportRequired = true;
		// shortcut variables for named exports of library modules
		// Each entry is a tuple {shortcut,stmtNode,declNode}
		this.shortcuts = Object.create(null);
		this.classDefinitions = Object.create(null);
		this.invalidExportNode = undefined;

		const args = node.arguments;
		let i = 0;

		if (args[i].type === Syntax.Literal) {
			this.name = (args[i++] as ESTree.Literal).value.toString();
		}

		if (args[i].type === Syntax.ArrayExpression) {
			this.dependencyArray = args[i++] as ESTree.ArrayExpression;
			this.dependencyInsertionIdx = this.dependencyArray.elements.length;
		}

		// There are sap.ui.defines which do not contain a function.
		// These should not fail here. The #factory property is then null.
		if (args[i] && args[i].type === Syntax.FunctionExpression) {
			this.factory = args[i++] as ESTree.FunctionExpression;
			const params = this.factory.params;
			this.paramNames = params.map(param => {
				if (param.type !== Syntax.Identifier) {
					throw new Error();
				}
				return param.name;
			});
			if (this.factory.params.length < this.dependencyInsertionIdx) {
				this.dependencyInsertionIdx = this.factory.params.length;
			}
		}

		if (i < args.length && args[i].type === Syntax.Literal) {
			this.bExportsNode = args[i++] as ESTree.Literal;
			if (typeof this.bExportsNode.value === "boolean") {
				this.exportToGlobal = this.bExportsNode.value;
			} else {
				this.invalidExportNode = this.bExportsNode.value.toString();
				this.reporter.report(ReportLevel.TRACE, "Invalid export name");
			}
		}

		if (
			this.factory &&
			((this.dependencyArray &&
				this.factory.params.length >
					this.dependencyArray.elements.length) ||
				(!this.dependencyArray && this.factory.params.length > 0))
		) {
			this.reporter.report(
				ReportLevel.TRACE,
				"**** warning: AMD factory has more parameters than dependencies!"
			);
		}

		if (this.factory) {
			this._analyzeBody();
		}
	}

	static _resolveRelativeImports(relValue, currentModule) {
		if (relValue.startsWith("./") && !currentModule.startsWith("./")) {
			if (currentModule.includes("/")) {
				relValue =
					currentModule.substring(0, currentModule.lastIndexOf("/")) +
					relValue.substring(".".length);
			} else {
				relValue = relValue.substring("./".length);
			}
		}
		return relValue;
	}

	/**
	 * Extracts the dependency paths and makes them absolute, e.g.
	 * sap.ui.define(["./c", "g/f/j"]) name: "a/b/mymodule"
	 * @returns {string[]} dependency array elements resolved absolutely, e.g. ["a/b/c", "g/f/j"]
	 */
	getAbsoluteDependencyPaths() {
		return this.dependencyArray.elements.map(oElement => {
			const value = (oElement as ESTree.Literal).value.toString();
			return SapUiDefineCall._resolveRelativeImports(value, this.name);
		});
	}

	/**
	 *
	 * @param {string} iIndex
	 * @param {string} sModule, e.g. sap/ui/thirdparty/jquery
	 * @param {string} sShortcut, e.g. jquery
	 * @returns {boolean}
	 */
	modifyDependency(iIndex: number, sModule: string, sShortcut?: string) {
		if (!this.dependencyArray) {
			const arrayExpression = builders.arrayExpression([]);
			this.node.arguments.splice(0, 0, arrayExpression);
			this.dependencyArray = this.node
				.arguments[0] as ESTree.ArrayExpression;
		}

		// check if dependency is already contained
		const i = iIndex;
		if (i < 0) {
			return false;
		}

		// add new dependency and shortcut
		this.dependencyArray.elements[i] = builders.literal(sModule);
		if (sShortcut && this.paramNames[i] !== sShortcut) {
			this.factory.params[i] = builders.identifier(sShortcut);
			this.paramNames[i] = sShortcut;
		}
		return true;
	}

	/**
	 * Adds a dependency
	 * @param {string} sModule
	 * @param {string} sShortcut
	 * @returns {boolean} whether or not dependency was added to dependencyArray
	 */
	addDependency(sModule: string, sShortcut?: string) {
		if (!this.dependencyArray) {
			const arrayExpression = builders.arrayExpression([]);
			this.node.arguments.splice(0, 0, arrayExpression);
			this.dependencyArray = this.node
				.arguments[0] as ESTree.ArrayExpression;
		}

		// check if dependency is already contained
		let i = this.dependencyArray.elements.findIndex(
			oElement =>
				oElement.type === "Literal" && oElement.value === sModule
		);
		if (i >= 0) {
			if (sShortcut && i >= this.paramNames.length) {
				// add shortcut by removing dependency and readd it
				this.dependencyArray.elements.splice(i, 1);
			} else if (sShortcut && this.paramNames[i] !== sShortcut) {
				// update shortcut
				this.paramNames[i] = sShortcut;
				return true;
			} else {
				// no shortcut to set
				return false;
			}
		}

		// add new dependency and shortcut
		i = this.dependencyInsertionIdx++;
		this.dependencyArray.elements.splice(i, 0, builders.literal(sModule));
		if (sShortcut) {
			this.factory.params.splice(i, 0, builders.identifier(sShortcut));
			this.paramNames.splice(i, 0, sShortcut);
		} else {
			// as there is no shortcut, the dependency insertion index needs to
			// be counted down, then the next time a dependency will be added at
			// the previous position and there is no conflict with missing
			// parameter names
			this.dependencyInsertionIdx--;
		}
		return true;
	}

	/**
	 * Removes a dependency
	 * define(["s"], function(sShortcut){})
	 * @return {boolean} whether or not dependency was removed
	 * @param {string} sModule module name, e.g. a/b/c
	 * @param {string} [sParam] module name, e.g. a/b/c
	 *
	 */
	removeDependency(sModule: string, sParam?: string) {
		if (!this.dependencyArray) {
			return false;
		}

		const aAlreadyMatchingElements = this.dependencyArray.elements.filter(
			oElement => {
				if (oElement.type !== "Literal") {
					throw new Error(
						"Dependency is not a literal in " + this.name
					);
				}
				return oElement.value === sModule;
			}
		);
		if (aAlreadyMatchingElements.length === 0) {
			return false;
		}

		let iIndexToRemove = this.dependencyArray.elements.indexOf(
			aAlreadyMatchingElements[0]
		);
		if (aAlreadyMatchingElements.length > 1 && sParam) {
			const iIndex = this.paramNames.indexOf(sParam);

			if (iIndex > 0) {
				const matchingIndexElements = aAlreadyMatchingElements.filter(
					oMatchingElement => {
						return (
							this.dependencyArray.elements.indexOf(
								oMatchingElement
							) === iIndex
						);
					}
				);
				if (matchingIndexElements.length === 1) {
					iIndexToRemove = iIndex;
				}
			}
		}

		if (iIndexToRemove === -1) {
			return false;
		}
		// elements[s]
		this.dependencyArray.elements.splice(iIndexToRemove, 1);

		// params[sShortcut]
		this.factory.params.splice(iIndexToRemove, 1);
		// sShortcut
		this.paramNames.splice(iIndexToRemove, 1);
		return true;
	}

	getImportByParamName(sShortcut: string): string {
		if (!this.dependencyArray) {
			return undefined;
		}

		const iIndex = this.paramNames.indexOf(sShortcut);

		if (iIndex < 0) {
			return undefined;
		}

		const oElement = this.dependencyArray.elements[iIndex];
		if (oElement.type !== Syntax.Literal) {
			throw new Error("Dependency is not a literal in " + this.name);
		}

		return oElement.value.toString();
	}

	getNodeOfParam(sShortcut: string): ESTree.Identifier {
		if (!this.dependencyArray) {
			return undefined;
		}

		const iIndex = this.paramNames.indexOf(sShortcut);

		if (iIndex < 0) {
			return undefined;
		}

		const oParam = this.factory.params[iIndex];

		if (oParam.type !== Syntax.Identifier) {
			throw new Error("Dependency is not a literal in " + this.name);
		}

		return oParam;
	}

	getParamNameByImport(sModule: string): string {
		const oMatchingElement = this.getNodeOfImport(sModule);
		if (!oMatchingElement) {
			return undefined;
		}

		const iIndexToRemove =
			this.dependencyArray.elements.indexOf(oMatchingElement);

		if (iIndexToRemove === -1) {
			return undefined;
		}

		return this.paramNames[iIndexToRemove];
	}

	getNodeOfImport(sModule: string): ESTree.Literal {
		if (!this.dependencyArray) {
			return undefined;
		}
		const aAlreadyMatchingElements = this.dependencyArray.elements.filter(
			oElement => {
				if (oElement.type !== "Literal") {
					throw new Error(
						"Dependency is not a literal in " + this.name
					);
				}
				return (
					oElement.value === sModule ||
					SapUiDefineCall._resolveRelativeImports(
						oElement.value,
						this.name
					) === sModule
				);
			}
		);
		if (aAlreadyMatchingElements.length === 0) {
			return undefined;
		}
		const oMatchingElement = aAlreadyMatchingElements[0];
		if (oMatchingElement.type === Syntax.Literal) {
			return oMatchingElement;
		}
		return undefined;
	}

	/**
	 * @param stmt statement
	 * @return {boolean} whether or not the factory was modified
	 */
	prependStatementToFactory(stmt: ESTree.Statement) {
		if (this.factory) {
			const statements = this.factory.body.body;
			let insertionPoint = 0;
			while (
				insertionPoint < statements.length &&
				SapUiDefineCallUtils.isDirective(statements[insertionPoint])
			) {
				insertionPoint++;
			}
			statements.splice(insertionPoint, 0, stmt);
			return true;
		}
		return false;
	}

	_analyzeBody() {
		let returns = 0;
		let exportName;
		const classDefinitions = (this.classDefinitions = {});

		// Pass 1: determine shortcut variables and module export (return value)
		this.factory.body.body.forEach(stmt => {
			if (stmt.type === Syntax.VariableDeclaration) {
				stmt.declarations.forEach(decl => {
					if (decl.id.type === Syntax.Identifier) {
						const shortcut =
							SapUiDefineCallUtils.checkForShortcutExpression(
								this,
								decl.init
							);
						if (shortcut) {
							const globalName =
								shortcut.module
									.replace(/\//g, ".")
									.replace(/\.library$/, "") +
								"." +
								shortcut.propertyPath;
							this.reporter.report(
								ReportLevel.DEBUG,
								"possible shortcut found:" +
									decl.id.name +
									" " +
									shortcut.leftmostName +
									"." +
									shortcut.propertyPath +
									" (" +
									globalName +
									")"
							);
							this.shortcuts[globalName] = {
								local: decl.id.name,
								module: shortcut.module,
								global: globalName,
								stmt,
								decl,
							};
						}
					}
					if (
						decl.id.type === Syntax.Identifier &&
						decl.init &&
						decl.init.type === Syntax.CallExpression &&
						decl.init.callee.type === Syntax.MemberExpression &&
						decl.init.callee.property.type === Syntax.Identifier &&
						decl.init.callee.property.name === "extend" &&
						decl.init.arguments.length > 0
					) {
						const init0 = decl.init.arguments[0];
						if (
							init0.type === Syntax.Literal &&
							typeof init0.value === "string"
						) {
							// console.log("found potential class definition %s
							// = %s", decl.id.name,
							// decl.init.arguments[0].value);
							classDefinitions[decl.id.name] = {
								name: init0.value,
								info: decl.init.arguments[1],
							};
						}
					}
				});
			} else if (stmt.type === Syntax.ReturnStatement) {
				returns++;
				if (stmt.argument && stmt.argument.type === Syntax.Identifier) {
					exportName = stmt.argument.name;
				}
			}
		});

		if (returns === 1 && exportName) {
			this.exportName = exportName;
			if (typeof classDefinitions[exportName] === "object") {
				this.reporter.report(
					ReportLevel.TRACE,
					"  module exports class %s",
					classDefinitions[exportName].name
				);
				this.globalExportRequired = false;
			}
		}

		// Pass 2: identify AMD factory and class methods
		Object.defineProperty(this.factory, "__classMethodName", {
			enumerable: false,
			value: "AMD-factory",
		});
		this.factory.body.body.forEach(stmt => {
			if (
				stmt.type === Syntax.ExpressionStatement &&
				stmt.expression.type === Syntax.AssignmentExpression &&
				this.exportName &&
				SapUiDefineCallUtils.isMemberOf(
					stmt.expression.left,
					this.exportName
				)
			) {
				if (
					stmt.expression.left.type === Syntax.MemberExpression &&
					stmt.expression.left.object.type ===
						Syntax.MemberExpression &&
					stmt.expression.left.object.property.type ===
						Syntax.Identifier &&
					stmt.expression.left.object.property.name === "prototype" &&
					stmt.expression.left.property.type === Syntax.Identifier
				) {
					this.reporter.report(
						ReportLevel.DEBUG,
						"  found class method: " +
							SapUiDefineCallUtils.getObjectName(
								stmt.expression.left
							)
					);
					Object.defineProperty(
						stmt.expression.right,
						"__classMethodName",
						{
							enumerable: false,
							value: stmt.expression.left.property.name,
						}
					);
				}
			}
		});
	}

	/**
	 * TODO find better name
	 * Modifies the factory by introducing a variable declaration
	 * @param localRef
	 * @param module
	 * @param memberName
	 * @param fullName
	 * @return
	 */
	addShortcut(localRef, module, memberName, fullName) {
		let bWasModified = false;
		if (typeof this.shortcuts[fullName] === "object") {
			return {
				modified: bWasModified,
				path: this.shortcuts[fullName].local,
			};
		}

		const shortcut = memberName.slice(memberName.lastIndexOf(".") + 1);

		// TODO Search for conflicts and resolve them

		function buildAccessTo(path) {
			const pos = path.lastIndexOf(".");
			if (pos >= 0) {
				builders.memberExpression(
					buildAccessTo(path.slice(0, pos)),
					builders.identifier(path.slice(pos + 1))
				);
			}
			return builders.identifier(path);
		}

		const shortcutVar = builders.variableDeclaration("var", [
			builders.variableDeclarator(
				builders.identifier(shortcut),
				builders.memberExpression(
					builders.identifier(localRef),
					buildAccessTo(memberName)
				)
			),
		]);
		shortcutVar.comments = shortcut.comments || [];
		shortcutVar.comments.push({
			type: "Line",
			value: " shortcut for " + fullName,
			leading: true,
		});

		this.reporter.report(
			ReportLevel.TRACE,
			"  add shortcut " + shortcut + " for " + localRef + "." + memberName
		);
		bWasModified = this.prependStatementToFactory(shortcutVar);

		this.shortcuts[fullName] = {
			local: shortcut,
			module,
			globalName: fullName,
			stmt: shortcutVar,
			decl: shortcutVar.declarations[0],
		};

		return {modified: bWasModified, path: shortcut};
	}

	/**
	 * Removes the shortcut for the given global name.
	 * @param {string} fullName
	 * @returns {object} object
	 */
	removeShortcut(fullName: string) {
		const shortcutInfo = this.shortcuts[fullName];
		if (shortcutInfo) {
			const i = shortcutInfo.stmt.declarations.indexOf(shortcutInfo.decl);
			if (i >= 0) {
				shortcutInfo.stmt.declarations.splice(i, 1);
				if (shortcutInfo.stmt.declarations.length === 0) {
					// TODO how to remove stmt as a whole?
					const j = this.factory.body.body.indexOf(shortcutInfo.stmt);
					if (j >= 0) {
						this.factory.body.body.splice(j, 1);
					} else {
						this.reporter.report(
							ReportLevel.TRACE,
							"**** could not find shortcut declaration in module factory"
						);
					}
				}
				delete this.shortcuts[fullName];
			} else {
				this.reporter.report(
					ReportLevel.TRACE,
					"**** could not find shortcut declaration"
				);
			}
			return shortcutInfo.local;
		}
	}

	setReporter(reporter: Reporter) {
		this.reporter = reporter;
	}
}
