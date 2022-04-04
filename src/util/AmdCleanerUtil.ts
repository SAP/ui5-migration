"use strict";

import {ConsoleReporter, Reporter, ReportLevel} from "../Migration";
import {SapUiDefineCall} from "./SapUiDefineCall";
import * as ASTUtils from "./ASTUtils";
import * as ESTree from "estree";
import {APIInfo} from "./APIInfo";
import * as NamespaceUtils from "./NamespaceUtils";
import {Expression} from "estree";
import * as Mod from "../Migration";
import * as ModuleNameComparator from "./ModuleNameComparator";
import * as VariableNameCreator from "./VariableNameCreator";

const recast = require("recast");
const Syntax = require("esprima").Syntax;

const builders = recast.types.builders;

/**
 *
 * @param ast
 * @param that
 * @param reporter
 * @param config
 * @param apiInfo
 * @return Promise<{}>
 */
async function fillApiInfo(ast, that, reporter: Reporter, config, apiInfo) {
	let aPromises: Array<Promise<{}>> = [];
	const aLaterPromises: Array<Promise<{}>> = [];
	recast.visit(ast, {
		visitMemberExpression(path) {
			if (that.isStaticGlobal(path, reporter)) {
				const name = that.getObjectName(path.value);

				// reporter.report(ReportLevel.DEBUG, " found ", name);
				// don't touch LHS member expressions (like in sap.m.ButtonStyle
				// = ...)
				if (
					path.parent &&
					path.parent.node.type === Syntax.AssignmentExpression &&
					path.parent.node.left === path.node &&
					!that.globalNameConvertedToAMDExport
				) {
					reporter.report(
						ReportLevel.TRACE,
						"  **** LHS of an assignment is not touched: " +
							name +
							".",
						path.parent.value.loc
					);
					return false;
				}

				if (that.isRHSOfInstanceOf(path)) {
					reporter.report(
						ReportLevel.DEBUG,
						"  RHS of instanceof operator not touched in pass 1: " +
							name +
							".",
						path.value.loc
					);
					return false;
				}

				if (config.excludes && config.excludes.indexOf(name) >= 0) {
					// do not traverse as the MemberExpression is fully handled
					// this.traverse(path);
					return false;
				}

				aPromises.push(that.resolveSymbol(name, apiInfo));
			} else if (that.isJQueryMember(path.value)) {
				const name = that.getObjectName(path.value);
				aPromises.push(that.resolveSymbol(name, apiInfo));
				// process remaining instanceof operators
			} else if (that.isRHSOfInstanceOf(path)) {
				const name = that.getObjectName(path.value);
				// try to find a module
				aLaterPromises.push(that.resolveSymbol(name, apiInfo));
			}
			this.traverse(path);
			return undefined;
		},
	});
	// TODO push the promises with the correct name and do a lookup later
	aPromises = aPromises.concat(aLaterPromises);
	return Promise.all(aPromises);
}

interface VisitCodeResult {
	fileWasModified: boolean;
	bWasDefined?: boolean;
	declareName?: string;
	bWasDeclared?: boolean;
}

function getArgumentName(value) {
	return value.arguments.map(o => o.value).join(",");
}

/**
 *
 * @param ast
 * @param that
 * @param reporter
 * @returns {{sDeclareName:string, path}}
 */
function getDeclareCallNameAndPath(ast, that, reporter) {
	const result = {sDeclareName: "", path: undefined};
	recast.visit(ast, {
		visitCallExpression(path) {
			if (that.isJQuerySAPDeclareCall(path.value)) {
				// remove
				reporter.report(
					ReportLevel.DEBUG,
					"remove jQuery.sap.declare(" +
						getArgumentName(path.value) +
						")",
					path.value.loc
				);

				if (
					path.value.arguments.length === 1 &&
					path.value.arguments[0].type === Syntax.Literal
				) {
					result.sDeclareName = (
						path.value.arguments[0] as ESTree.Literal
					).value.toString();
				}
				result.path = path;
			}
			this.traverse(path);
			return undefined;
		},
	});
	return result;
}

function getExtendCalls(ast, that) {
	const aResult = [];
	recast.visit(ast, {
		visitCallExpression(path) {
			if (that.isExtendCall(path.value)) {
				aResult.push(path.value);
			}
			this.traverse(path);
			return undefined;
		},
	});
	return aResult;
}

function getExtendCallName(ast, that) {
	const aExtendCalls = getExtendCalls(ast, that);

	if (aExtendCalls.length === 1) {
		return aExtendCalls[0].arguments[0].value.toString();
	}
	return "";
}

/**
 * Replaces self calls, e.g. module name is "a.b.c" replace each "a.b.c.x = 5"
 * call/assignment
 * @param ast
 * @param that
 * @param reporter
 * @param config
 * @param fnGetSymbol
 * @param aModificationsPromise
 * @param modify
 * @param oAnalysisResult
 * @param aUsedVariables
 */
function replaceSelfCalls(
	ast,
	that,
	reporter: Reporter,
	config,
	fnGetSymbol,
	aModificationsPromise,
	modify: boolean,
	oAnalysisResult,
	aUsedVariables: string[]
): VisitCodeResult {
	let bWasDefined = false;
	let bFileWasModified = false;
	let bWasDeclared = false;

	// check for declare, e.g. jQuery.sap.declare("a.b.c");
	const declareResult = getDeclareCallNameAndPath(ast, that, reporter);
	let sDeclareName = declareResult.sDeclareName;

	if (sDeclareName) {
		bWasDeclared = true;
	}

	if (!sDeclareName) {
		sDeclareName = getExtendCallName(ast, that);
	}

	// remove declare call
	if (declareResult.path) {
		if (modify) {
			bFileWasModified = true;
			// restore comments of declare (add them to the define call)
			if (declareResult.path.parentPath.value.comments) {
				that.defineCall.node.comments =
					declareResult.path.parentPath.value.comments.slice();
			}
			declareResult.path.prune();
		} else {
			reporter.storeFinding(
				"remove declare statement",
				declareResult.path.value.loc
			);
			oAnalysisResult["remove-path"] =
				oAnalysisResult["remove-path"] || [];
			oAnalysisResult["remove-path"].push("jQuery.sap.declare");
		}
	}

	// if declare was found and it is assigned
	// @example e.g. a.b.c = {...}
	// -> replace with variable c = {...}
	if (sDeclareName && modify) {
		recast.visit(ast, {
			visitMemberExpression(path) {
				if (that.isStaticGlobal(path, reporter)) {
					const name = that.getObjectName(path.value);

					// check if level is the same as the return statement
					if (
						path.parent &&
						path.parent.node.type === Syntax.AssignmentExpression &&
						path.parent.node.left === path.node &&
						that.isModuleBodyStatement(
							path.parent.parentPath.value,
							that.defineCall
						)
					) {
						if (ModuleNameComparator.compare(name, sDeclareName)) {
							const sVariableName =
								VariableNameCreator.getUniqueVariableName(
									aUsedVariables,
									sDeclareName
								);

							// store comments
							let aComments =
								path.parentPath.parentPath.parent.node[
									path.parentPath.parentPath.parent.name
								][path.parentPath.parentPath.name].comments;
							aComments = aComments ? aComments.slice() : [];
							const newVariableDeclaration =
								builders.variableDeclaration("var", [
									builders.variableDeclarator(
										builders.identifier(sVariableName),
										path.parent.node.right
									),
								]);
							path.parentPath.parentPath.parent.node[
								path.parentPath.parentPath.parent.name
							][path.parentPath.parentPath.name] =
								newVariableDeclaration;

							// add comments to replacement
							if (aComments.length > 0) {
								newVariableDeclaration.comments = aComments;
							}
							bWasDefined = true;
							bFileWasModified = true;
							reporter.report(
								Mod.ReportLevel.DEBUG,
								"Added variable " + sVariableName,
								path.value.loc
							);
						}
					}
				}
				this.traverse(path);
				return undefined;
			},
		});

		//
		// module is extended and neither assigned to a variable nor returned
		// @example e.g. AppComponent.extend("a.b.c", {});
		// -> replace it with var c = AppComponent.extend("a.b.c", {});
		//
		if (sDeclareName && modify && !bWasDefined) {
			recast.visit(ast, {
				visitCallExpression(path) {
					if (
						that.isExtendCall(path.value) &&
						path.parentPath.value.type !== Syntax.ReturnStatement &&
						path.parentPath.value.type !==
							Syntax.VariableDeclarator &&
						path.value.arguments[0].value.toString() ===
							sDeclareName
					) {
						const sVariableName =
							VariableNameCreator.getUniqueVariableName(
								aUsedVariables,
								sDeclareName
							);
						path.parentPath.parentPath.value[path.parentPath.name] =
							builders.variableDeclaration("var", [
								builders.variableDeclarator(
									builders.identifier(sVariableName),
									path.value
								),
							]);
						bWasDefined = true;
						bFileWasModified = true;

						reporter.report(
							Mod.ReportLevel.DEBUG,
							"Added variable declaration " + sVariableName,
							path.value.loc
						);
					}
					this.traverse(path);
					return undefined;
				},
			});
		}

		// if it was assigned, replace each occurrence, e.g. a.b.c.x = 5;
		// -> replace with variable c.x = 5;
		if (bWasDefined && modify) {
			recast.visit(ast, {
				visitMemberExpression(path) {
					if (that.isStaticGlobal(path, reporter)) {
						const name = that.getObjectName(path.value);

						if (ModuleNameComparator.compare(name, sDeclareName)) {
							const sVariableName =
								VariableNameCreator.getUniqueVariableName(
									aUsedVariables,
									sDeclareName
								);
							path.parent.node[path.name] =
								builders.identifier(sVariableName);
							bFileWasModified = true;

							reporter.report(
								Mod.ReportLevel.DEBUG,
								"Replace using variable " + sVariableName,
								path.value.loc
							);
						}
					}
					this.traverse(path);
					return undefined;
				},
			});
		}
	}

	return {
		fileWasModified: bFileWasModified,
		declareName: sDeclareName,
		bWasDefined,
		bWasDeclared,
	};
}

/**
 *
 * @param ast
 * @param that
 * @param reporter
 * @param config
 * @param fnGetSymbol
 * @param aModificationsPromise
 * @param modify
 * @param bFileWasModified
 * @param oAnalysisResult
 * @return
 */
function visitCode(
	ast,
	that,
	reporter: Reporter,
	config,
	fnGetSymbol,
	aModificationsPromise,
	modify: boolean,
	bFileWasModified: boolean,
	oAnalysisResult
): VisitCodeResult {
	recast.visit(ast, {
		visitCallExpression(path) {
			// reporter.report(ReportLevel.DEBUG,
			// JSON.stringify(path.value,null,'\t'));
			if (that.isJQuerySAPRequireCall(path.value)) {
				const loc = path.value.loc;
				reporter.report(
					ReportLevel.DEBUG,
					"jQuery.sap.require(" + getArgumentName(path.value) + ")",
					loc
				);

				// only process jQuery.sap.require calls and modify the AST if
				// modify flag is true
				if (modify) {
					const processResult = that.processJQuerySAPRequireCall(
						path,
						config,
						reporter
					);
					if (processResult.modified) {
						bFileWasModified = true;
					}

					// if path was not already pruned (modified) execute it here
					// to get rid of the jQuery.sap.require call.
					if (!processResult.pruned) {
						reporter.report(
							Mod.ReportLevel.DEBUG,
							"Remove jquery sap require call",
							loc
						);
						path.prune();
						bFileWasModified = true;
					} else {
						reporter.storeFinding(
							"found jQuery.sap.require",
							path.loc
						);
						oAnalysisResult["remove-path"] =
							oAnalysisResult["remove-path"] || [];
						oAnalysisResult["remove-path"].push(
							"jQuery.sap.require"
						);
					}
				}
			}
			this.traverse(path);
			return undefined;
		},
		visitMemberExpression(path) {
			if (that.isStaticGlobal(path, reporter)) {
				const name = that.getObjectName(path.value);

				// reporter.report(ReportLevel.DEBUG, " found ", name);
				// don't touch LHS member expressions (like in sap.m.ButtonStyle
				// = ...)
				if (
					path.parent &&
					path.parent.node.type === Syntax.AssignmentExpression &&
					path.parent.node.left === path.node &&
					!that.globalNameConvertedToAMDExport
				) {
					reporter.report(
						ReportLevel.TRACE,
						"  **** LHS of an assignment is not touched: " +
							name +
							".",
						path.parent.value.loc
					);
					return false;
				}

				if (that.isRHSOfInstanceOf(path)) {
					reporter.report(
						ReportLevel.DEBUG,
						"  RHS of instanceof operator not touched in pass 1: " +
							name +
							".",
						path.value.loc
					);
					return false;
				}

				if (config.excludes && config.excludes.indexOf(name) >= 0) {
					// do not traverse as the MemberExpression is fully handled
					// this.traverse(path);
					return false;
				}

				const oSymbol = fnGetSymbol(name);

				if (
					config.optionalDependency &&
					config.optionalDependency.indexOf(name) >= 0
				) {
					// do not traverse as the MemberExpression is fully handled
					// this.traverse(path);
					reporter.report(
						Mod.ReportLevel.DEBUG,
						"Optional dependency",
						path.value.loc
					);
					that.addDependencyUsage(oSymbol.module, name, reporter);
					return false;
				}

				if (oSymbol) {
					const isSafe =
						that.isSafeModule(oSymbol.module, config) ||
						that.isSafeLocation(path);
					if (isSafe || !config.onlySafeReplacements) {
						// reporter.report(ReportLevel.DEBUG, "  " + name + "
						// --> " + "{" + resolve.module + "}" + (resolve.export
						// === undefined ? "?" + name : resolve.export + "(." +
						// resolve.member + ")") );
						let localRef = undefined;

						if (modify) {
							const addDependencyResult = that.addDependency(
								that.defineCall,
								oSymbol.module,
								name,
								reporter
							);
							reporter.report(
								Mod.ReportLevel.DEBUG,
								"Add dependency for " + name,
								path.value.loc
							);
							localRef = addDependencyResult.path;
							bFileWasModified =
								bFileWasModified ||
								addDependencyResult.modified;
						} else {
							reporter.storeFinding(
								"add dependency",
								path.value.loc
							);
							oAnalysisResult["addDependency"] =
								oAnalysisResult["addDependency"] || [];

							oAnalysisResult["addDependency"].push({
								moudle: oSymbol.module,
								name,
							});
						}
						// if an export is known, replace global access path
						// with local shortcut + export path
						if (!localRef) {
							reporter.report(
								ReportLevel.TRACE,
								"keep global access to '" +
									name +
									"' (reference to self)",
								path.value.loc
							);
						} else if (oSymbol.export === undefined) {
							reporter.report(
								ReportLevel.TRACE,
								"keep global access to '" +
									name +
									"' (no module export known)",
								path.value.loc
							);
						} else {
							let replacement;
							let replacementStr;
							if (oSymbol.export) {
								// builders.assignment(builders.identifier(resolve.export),
								// builders.memberExpression(
								// builders.identifier(localRef),
								// builders.identifier(resolve.export) ))
								let shortcut = null;
								if (modify) {
									const oAddShortCutResult =
										that.defineCall.addShortcut(
											localRef,
											oSymbol.module,
											oSymbol.export,
											oSymbol.symbol.name
										);
									bFileWasModified =
										bFileWasModified ||
										oAddShortCutResult.modified;
									shortcut = oAddShortCutResult.path;
									reporter.report(
										Mod.ReportLevel.DEBUG,
										"Add shortcut",
										path.value.loc
									);
								} else {
									reporter.storeFinding(
										"add shortcut",
										path.value.loc
									);
									oAnalysisResult["addShortcut"] =
										oAnalysisResult["addShortcut"] || [];

									oAnalysisResult["addShortcut"].push({
										localRef,
										moudle: oSymbol.module,
										exportName: oSymbol.export,
										symbolName: oSymbol.symbol.name,
									});
								}

								// check special case where original code
								// introduced a shortcut already: remove
								// shortcut
								if (
									path.parent &&
									path.parent.node.type ===
										Syntax.VariableDeclarator &&
									path.parent.node.init === path.node
								) {
									if (
										path.parent.node.id.type ===
											Syntax.Identifier &&
										path.parent.node.id.name === shortcut
									) {
										reporter.report(
											ReportLevel.DEBUG,
											"**** found shortcut of same name",
											path.value.loc
										);
										if (modify) {
											path.parent.prune();
										}
										return false;
									}
								}

								replacement = builders.identifier(shortcut);
								replacementStr = shortcut;
							} else {
								// check special case where original code
								// introduced a shortcut already: remove
								// shortcut
								if (
									path.parent &&
									path.parent.node.type ===
										Syntax.VariableDeclarator &&
									path.parent.node.init === path.node
								) {
									reporter.report(
										ReportLevel.DEBUG,
										"  removing redundant shortcut var ",
										path.parent.node.loc
									);
									return false;
								}

								replacement = builders.identifier(localRef);
								replacementStr = localRef;
							}
							// wrap with a member expression if necessary
							if (oSymbol.member) {
								// TODO handle deeper path
								const identifier = builders.identifier(
									oSymbol.member
								);
								replacement = builders.memberExpression(
									replacement,
									identifier
								);
								replacementStr =
									replacementStr + "." + oSymbol.member;
							}
							reporter.report(
								ReportLevel.DEBUG,
								"  replace " + name + " with " + replacementStr,
								path.value.loc
							);
							if (
								!isSafe &&
								config.addTodoForUnsafeReplacements
							) {
								replacement.comments =
									replacement.comments || [];
								replacement.comments.push({
									type: "Block",
									value: "TODO review import and replacement",
									leading: true,
								});
							}
							if (modify) {
								const oLoc = path.value.loc;
								path.replace(replacement);
								bFileWasModified = true;
								reporter.report(
									Mod.ReportLevel.DEBUG,
									"Replace occurrence of " + replacementStr,
									oLoc
								);
							} else {
								reporter.storeFinding(
									"replace",
									path.value.loc
								);
								oAnalysisResult["replace"] =
									oAnalysisResult["replace"] || [];

								oAnalysisResult["replace"].push({
									path,
									replacement,
								});
							}
						}
						return false;
					} else {
						reporter.report(
							ReportLevel.WARNING,
							"  **** unsafe replacement skipped: " +
								oSymbol.module +
								" (" +
								name +
								")",
							path.value.loc
						);
						return false;
					}
				}
			} else if (that.isJQueryMember(path.value)) {
				const name = that.getObjectName(path.value);
				const oSymbol = fnGetSymbol(name);

				if (oSymbol) {
					// reporter.report(ReportLevel.DEBUG, "  " + name + " --> "
					// + "{" + oSymbol.module + "}"
					// + (oSymbol.export === undefined ? " " + name :
					// oSymbol.export) );
					/* var localRef = */
					if (modify) {
						const oAddDependencyResult = that.addDependency(
							that.defineCall,
							oSymbol.module,
							name,
							reporter
						);
						bFileWasModified =
							bFileWasModified || oAddDependencyResult.modified;
						reporter.report(
							Mod.ReportLevel.DEBUG,
							"Add dependency",
							path.value.loc
						);
					} else {
						reporter.storeFinding("add dependency", path.value.loc);
						oAnalysisResult["addDependency"] =
							oAnalysisResult["addDependency"] || [];

						oAnalysisResult["addDependency"].push({
							moudle: oSymbol.module,
							name,
						});
					}
				}
			}
			this.traverse(path);
			return undefined;
		},
	});

	// process remaining instanceof operators
	recast.visit(ast, {
		visitMemberExpression(path) {
			if (
				that.isStaticGlobal(path, reporter) &&
				that.isRHSOfInstanceOf(path)
			) {
				const name = that.getObjectName(path.value);
				// try to find a module
				const oSymbol = fnGetSymbol(name);
				// option 1: if there's a module, find an existing import and
				// use that
				const localRef =
					oSymbol &&
					oSymbol.module &&
					that.findDependency(oSymbol.module);
				if (localRef) {
					reporter.report(
						ReportLevel.DEBUG,
						"  replace '... instanceof " +
							localRef +
							"' with '... instanceof " +
							name +
							"'",
						path.value.loc
					);
					if (modify) {
						path.replace(builders.identifier(localRef));
						bFileWasModified = true;
					} else {
						reporter.storeFinding("replace", path.value.loc);
						oAnalysisResult["replace"] =
							oAnalysisResult["replace"] || [];

						oAnalysisResult["replace"].push({
							identifier: localRef,
							path,
						});
					}
					return false;
				}

				// option 2: if there's a module and its default export
				// represents the class, use the weak instanceof method
				if (config.useWeakInstanceof && oSymbol && !oSymbol.export) {
					reporter.report(
						ReportLevel.DEBUG,
						"  replace '... instanceof " +
							name +
							"' with 'sap.ui.instanceof(...,'" +
							oSymbol.module +
							"')",
						path.value.loc
					);
					if (modify) {
						path.parent.replace(
							builders.callExpression(
								builders.memberExpression(
									builders.memberExpression(
										builders.identifier("sap"),
										builders.identifier("ui")
									),
									builders.identifier("instanceof")
								),
								[
									path.parent.node.left,
									builders.literal(oSymbol.module),
								]
							)
						);
						bFileWasModified = true;
						reporter.report(
							Mod.ReportLevel.DEBUG,
							"Parent replacement",
							path.value.loc
						);
					} else {
						reporter.storeFinding("replace parent", path.value.loc);
						oAnalysisResult["parentReplace"] =
							oAnalysisResult["parentReplace"] || [];

						oAnalysisResult["parentReplace"].push({
							member: "sap.ui.instanceof",
							node: path.parent,
							argLeft: path.parent.node.left,
							literal: oSymbol.module,
						});
					}
					return false;
				}

				// no way to replace it
				reporter.report(
					ReportLevel.DEBUG,
					"  **** '... instanceof " + name + "' not touched",
					path.value.loc
				);
			}
			this.traverse(path);
			return undefined;
		},
	});
	return {fileWasModified: bFileWasModified};
}

module.exports = {
	/**
	 *
	 * @param {object} ast abstract syntax tree
	 * @param {string} moduleName plain module name (file name including the path)
	 * @param {string} namespace full namespace including module name, e.g. a.b.c
	 * @param {object} config configuration
	 * @param {APIInfo} apiInfo api info
	 * @param {boolean} modify whether or not to modify the AST
	 * @param {Reporter} reporter
	 * @returns Promise {{ast: *, dependencies: *, oAnalysisResult: *}}
	 */
	async ui52amd(
		ast: ESTree.Node,
		moduleName: string,
		namespace: string,
		config: {removeUnusedDependencies?: boolean},
		apiInfo: APIInfo,
		modify = true,
		reporter: Reporter = new ConsoleReporter(ReportLevel.INFO)
	) {
		const oAnalysisResult = Object.create(null);
		let bFileWasModified = false;
		/*
		 * whether the export of the current AMD module has been converted from
		 * global name syntax. If so, then occurrences of the module global name
		 * on the LHS of an assignment are converted, otherwise they aren't.
		 */
		this.globalNameConvertedToAMDExport = false;
		this.dependencies = {};
		let blockStatementOfCreatedDefineCall = null;

		// reporter.report(ReportLevel.DEBUG, JSON.stringify(ast,null,'\t'));
		const defineCalls = ASTUtils.findCalls(
			ast,
			SapUiDefineCall.isValidRootPath
		);
		let defineCallNode;
		if (defineCalls.length > 1) {
			throw new Error("can't handle files with multiple modules");
		} else if (defineCalls.length === 1) {
			defineCallNode = defineCalls[0].value;
			reporter.report(
				ReportLevel.DEBUG,
				"found define call at position 0"
			);
		} else {
			// should check for and complain about global variable declarations
			(ast as ESTree.Program).body.forEach((node: ESTree.Node) => {
				if (node.type === Syntax.VariableDeclaration) {
					throw new Error(
						"Defines global variables and can't be wrapped into an AMD module"
					);
				}
			});

			// identify content of AMD factory function
			let block;
			const topLevelStmts = (ast as ESTree.Program).body;
			let topLevelComments;

			const relevantTopLevelStatements =
				this.getRelevantNodes(topLevelStmts);
			if (
				relevantTopLevelStatements.length === 1 &&
				this.isIIFEWithoutArguments(relevantTopLevelStatements[0])
			) {
				// unwrap an IIFE if it doesn't have arguments
				block = (
					(
						(
							relevantTopLevelStatements[0] as ESTree.ExpressionStatement
						).expression as ESTree.CallExpression
					).callee as ESTree.FunctionExpression
				).body as ESTree.BlockStatement;
				if (topLevelStmts.length > 1) {
					const iifeUnwrapped = block.body.filter(node => {
						return !this.containsUseStrict(node);
					});
					const iifeIndex = topLevelStmts.indexOf(
						relevantTopLevelStatements[0]
					);

					// include all other statements
					const topLevelStatementsClone = [
						...topLevelStmts.slice(0, iifeIndex),
						...iifeUnwrapped,
						...topLevelStmts.slice(iifeIndex + 1),
					];
					block = builders.blockStatement(topLevelStatementsClone);
				}

				topLevelComments = (
					topLevelStmts[0] as ESTree.ExpressionStatement
				).leadingComments;
				if (!topLevelComments) {
					topLevelComments = topLevelStmts[0]["comments"];
				}
			} else {
				block = builders.blockStatement(topLevelStmts);
			}

			if (!this.containsUseStrict(block.body[0])) {
				block.body.unshift(
					builders.expressionStatement(builders.literal("use strict"))
				);
			}

			// create a define call
			const sapUiMemberExpr = builders.memberExpression(
				builders.identifier("sap"),
				builders.identifier("ui")
			);
			defineCallNode = builders.callExpression(
				builders.memberExpression(
					sapUiMemberExpr,
					builders.identifier("define")
				),
				[
					builders.arrayExpression([]),
					builders.functionExpression(null, [], block),
				]
			);

			// make the define call the only top level statement
			if (modify) {
				(ast as ESTree.Program).body = [
					builders.expressionStatement(defineCallNode),
				];
				bFileWasModified = true;
				reporter.report(
					Mod.ReportLevel.DEBUG,
					"Create empty define call",
					(ast as ESTree.Program).loc
				);
			} else {
				reporter.storeFinding(
					"Create define call",
					(ast as ESTree.Program).loc
				);
				oAnalysisResult["body"] = oAnalysisResult["body"] || [];

				oAnalysisResult["body"].push({
					path: (ast as ESTree.Program).body,
					expression: defineCallNode,
				});
			}

			// preserve the top level comments
			if (topLevelComments) {
				(ast as ESTree.Program).comments = topLevelComments;
			}

			// ast.loc = undefined;
			blockStatementOfCreatedDefineCall = block;
		}

		this.defineCall = new SapUiDefineCall(
			defineCallNode,
			(namespace && namespace.split(".").join("/")) || moduleName,
			reporter
		);

		if (!this.defineCall.factory) {
			// exit
			return {
				modified: false,
				ast,
				dependencies: [],
				// for the analyze task modify is false therefore return
				// AnalysisResult
				oAnalysisResult: modify ? undefined : oAnalysisResult,
			};
		}
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;

		const aUsedVariables = findVariableDeclarationNames(ast);

		// reporter.report(ReportLevel.DEBUG, "define call");
		// reporter.report(ReportLevel.DEBUG, defineCall);
		// if a define call has been created, try to identify the export value
		// and add a return statement for it
		if (blockStatementOfCreatedDefineCall) {
			if (modify) {
				const oConvertExportResult = this.convertExport(
					this.defineCall,
					blockStatementOfCreatedDefineCall,
					reporter
				);
				bFileWasModified =
					bFileWasModified || oConvertExportResult.modified;
				this.globalNameConvertedToAMDExport =
					oConvertExportResult.globalNameConvertedToAMDExport;

				if (oConvertExportResult.modified) {
					reporter.report(
						Mod.ReportLevel.DEBUG,
						"Convert export",
						(ast as ESTree.Program).loc
					);
				}
			} else {
				reporter.storeFinding(
					"Convert export",
					(ast as ESTree.Program).loc
				);
				oAnalysisResult["convertExport"] =
					oAnalysisResult["convertExport"] || [];

				oAnalysisResult["convertExport"].push({
					blockStatementOfCreatedDefineCall,
				});
			}
		}

		// TODO should only visit content of factory function

		const encapsulate = function (aPromiseResults) {
			return function (name: string) {
				const aRes = aPromiseResults.filter(oResult => {
					return (
						oResult &&
						oResult.symbol &&
						oResult.symbol.name === name
					);
				});
				if (aRes.length > 0) {
					// TODO which one to return
					return aRes[aRes.length - 1];
				}
			};
		};

		// Store modifications
		return fillApiInfo(ast, that, reporter, config, apiInfo)
			.then(aPromiseResults => {
				const aModificationsPromise: Array<Promise<{}>> = [];
				const oResult = replaceSelfCalls(
					ast,
					that,
					reporter,
					config,
					encapsulate(aPromiseResults),
					aModificationsPromise,
					modify,
					oAnalysisResult,
					aUsedVariables
				);

				return {oResult, aPromiseResults};
			})
			.then(oObject => {
				bFileWasModified =
					bFileWasModified || oObject.oResult.fileWasModified;
				const aModificationsPromise: Array<Promise<{}>> = [];
				const visitCodeResult = visitCode(
					ast,
					that,
					reporter,
					config,
					encapsulate(oObject.aPromiseResults),
					aModificationsPromise,
					modify,
					bFileWasModified,
					oAnalysisResult
				);
				bFileWasModified = visitCodeResult.fileWasModified;

				// identify unused imports
				const aUnusedImportNames = config.removeUnusedDependencies
					? identifyUnusedImports(that)
					: [];

				return Promise.all(aModificationsPromise).then(() => {
					// remove unused dependencies
					if (config.removeUnusedDependencies) {
						bFileWasModified =
							removeUnusedDependencies(
								aUnusedImportNames,
								that,
								moduleName,
								reporter,
								modify,
								ast,
								oAnalysisResult
							) || bFileWasModified;
					}

					// if the module doesn't require the bExport flag, remove it
					if (
						that.defineCall &&
						!that.defineCall.globalExportRequired &&
						that.defineCall.bExportsNode
					) {
						const args = that.defineCall.node.arguments;
						args.splice(args.length - 1, 1);
					}

					if (
						oObject.oResult.declareName &&
						oObject.oResult.bWasDefined
					) {
						const aBody = that.defineCall.factory.body.body;
						const oLastStatement = aBody[aBody.length - 1];
						if (
							oLastStatement &&
							oLastStatement.type !== Syntax.ReturnStatement
						) {
							const sVariableName =
								VariableNameCreator.getUniqueVariableName(
									aUsedVariables,
									oObject.oResult.declareName
								);
							if (modify) {
								aBody.push(
									builders.returnStatement(
										builders.identifier(sVariableName)
									)
								);
								reporter.report(
									Mod.ReportLevel.DEBUG,
									"Added return statement of " +
										sVariableName,
									oLastStatement.loc
								);
							} else {
								reporter.storeFinding(
									"return statement",
									oLastStatement.loc
								);
								oAnalysisResult["returnStatement"] =
									oAnalysisResult["returnStatement"] || [];

								oAnalysisResult["returnStatement"].push({
									module: sVariableName,
								});
							}
						}
						if (!that.defineCall.bExportsNode) {
							if (modify) {
								const args = that.defineCall.node.arguments;
								args.push(builders.identifier("true"));
								reporter.report(
									Mod.ReportLevel.DEBUG,
									"Added true for global export",
									oLastStatement.loc
								);
							} else {
								reporter.storeFinding(
									"Add true for global export",
									oLastStatement.loc
								);
								oAnalysisResult["globalExport"] =
									oAnalysisResult["globalExport"] || [];

								oAnalysisResult["globalExport"].push({
									module: "true",
								});
							}
						}
					}

					// find namespace usage which shares declared module's
					// namespace
					if (
						modify &&
						oObject.oResult.declareName &&
						oObject.oResult.bWasDeclared &&
						oObject.oResult.declareName.split(".").length > 1
					) {
						const sNamespace =
							oObject.oResult.declareName.substring(
								0,
								oObject.oResult.declareName.lastIndexOf(".")
							);
						const bNamespaces = NamespaceUtils.findNamespaceUsage(
							ast,
							sNamespace
						);
						if (bNamespaces) {
							const objectCreateCall =
								NamespaceUtils.introduceObjectPathCreate(
									that.defineCall,
									sNamespace
								);
							const aBody = that.defineCall.factory.body.body;
							aBody.splice(1, 0, objectCreateCall);
						}
					}

					if (!modify) {
						oAnalysisResult.defineCall = that.defineCall;
					}
					return {
						modified: bFileWasModified,
						ast,
						dependencies: that.dependencies,
						// for the analyze task modify is false therefore return
						// AnalysisResult
						oAnalysisResult: modify ? undefined : oAnalysisResult,
					};
				});
			});
	},

	/**
	 *
	 * @param defineCall
	 * @param reporter
	 * @deprecated this should be done using a proper normalization task,
	 * instead of doing recast hax
	 * @return {boolean} whether or not dependency quotes were modified
	 */
	normalizeDependencyQuotes(defineCall: SapUiDefineCall, reporter: Reporter) {
		let bModified = false;
		if (
			defineCall &&
			defineCall.dependencyArray &&
			defineCall.dependencyArray.elements.length > 0
		) {
			reporter.report(
				ReportLevel.DEBUG,
				"  normalizing dependency quotes"
			);
			let iCountDoubleQuotes = 0;
			defineCall.dependencyArray.elements.forEach((dep: ESTree.Node) => {
				if (
					dep.type === Syntax.Literal &&
					typeof (dep as ESTree.Literal).value === "string" &&
					(dep as ESTree.Literal).raw
				) {
					if ((dep as ESTree.Literal).raw.charAt(0) === '"') {
						iCountDoubleQuotes++;
					} else {
						iCountDoubleQuotes--;
					}
				}
			});
			if (
				iCountDoubleQuotes !== 0 &&
				iCountDoubleQuotes !==
					defineCall.dependencyArray.elements.length
			) {
				const quote = iCountDoubleQuotes < 0 ? "'" : '"';
				const elements: Expression[] =
					defineCall.dependencyArray.elements.map(
						(dep: ESTree.Expression) => {
							if (
								dep.type === Syntax.Literal &&
								typeof (dep as ESTree.Literal).value ===
									"string" &&
								(!(dep as ESTree.Literal).raw ||
									(dep as ESTree.Literal).raw.charAt(0) !==
										quote)
							) {
								bModified = true;
								// TODO in theory requires quoting of value, but
								// shouldn't be necessary for AMD dependencies
								(dep as ESTree.Literal).raw =
									quote +
									(dep as ESTree.Literal).value +
									quote;

								// TODO this is a dirty hack here
								const dir = builders.stringLiteral(
									quote +
										(dep as ESTree.Literal).value +
										quote
								);
								dir.value =
									quote +
									(dep as ESTree.Literal).value +
									quote;
								return dir;
							}
							return dep;
						}
					);
				if (bModified) {
					defineCall.dependencyArray.elements = elements;
				}
			}
		}
		return bModified;
	},

	isLibraryFor(module, libCandidate) {
		const match = /^(.*\/)library$/.exec(libCandidate);
		return match && module.indexOf(match[1]) === 0;
	},

	/**
	 *
	 * @param defineCall
	 * @param node
	 * @param reporter
	 * @return {boolean} whether or not ast was modified
	 */
	convertExport(
		defineCall: SapUiDefineCall,
		node: ESTree.Node,
		reporter: Reporter
	) {
		let mainClassName;
		let mainClassNameShortcut = undefined;
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;

		/*
		 * check whether the left hand side of the assignment is a global name
		 * that matches the module name. If so, remember that name and create a
		 * shortcut name
		 */
		function isMainAssignment(assignment) {
			const name = that.getObjectName(assignment.left);
			if (name && name.replace(/\./g, "/") === defineCall.name) {
				mainClassName = name;
				mainClassNameShortcut = name.slice(name.lastIndexOf(".") + 1);
				return true;
			}
			return undefined;
		}

		function isMainClassDefinition(call) {
			if (!that.isExtendCall(call)) {
				return false;
			}
			const className = call.arguments[0].value;
			return className.replace(/\./g, "/") === defineCall.name;
		}

		function handleExtendCall(call) {
			const className = call.arguments[0].value;
			if (className.replace(/\./g, "/") === defineCall.name) {
				mainClassName = className;
				mainClassNameShortcut = className.slice(
					className.lastIndexOf(".") + 1
				);
			}
		}

		// reporter.report(ReportLevel.DEBUG, node);
		let bModified = false;
		let globalNameConvertedToAMDExport = false;
		if (node && node.type === Syntax.BlockStatement) {
			let exportVar;
			(node as ESTree.BlockStatement).body.forEach((stmt, idx) => {
				if (stmt.type === Syntax.ExpressionStatement) {
					const expression = (stmt as ESTree.ExpressionStatement)
						.expression;
					if (
						expression.type === Syntax.AssignmentExpression &&
						isMainAssignment(expression)
					) {
						(node as ESTree.BlockStatement).body[idx] =
							builders.variableDeclaration("var", [
								builders.variableDeclarator(
									builders.identifier(mainClassNameShortcut), // TODO check
									// that name is
									// not used yet
									(expression as ESTree.AssignmentExpression)
										.right
								),
							]);
						bModified = true;
						exportVar = mainClassNameShortcut;
						globalNameConvertedToAMDExport = mainClassName;
					} else if (isMainClassDefinition(expression)) {
						handleExtendCall(expression);
						(node as ESTree.BlockStatement).body[idx] =
							builders.variableDeclaration("var", [
								builders.variableDeclarator(
									builders.identifier(mainClassNameShortcut), // TODO check
									// that name is
									// not used yet
									expression
								),
							]);
						exportVar = mainClassNameShortcut;
						globalNameConvertedToAMDExport = mainClassName;
						bModified = true;
					} else if (
						expression.type === Syntax.AssigmnentExpression &&
						mainClassName &&
						mainClassName ===
							that.getObjectName(
								(expression as ESTree.AssignmentExpression).left
							)
					) {
						(expression as ESTree.AssignmentExpression).left =
							builders.identifier(mainClassNameShortcut);
						reporter.report(
							ReportLevel.DEBUG,
							"  replace LHS qualified name " +
								mainClassName +
								" with shortcut " +
								mainClassNameShortcut,
							node.loc
						);
						bModified = true;
					}
				}
			});
			if (exportVar) {
				(node as ESTree.BlockStatement).body.push(
					builders.returnStatement(
						builders.identifier(mainClassNameShortcut)
					)
				);
				defineCall.exportName = exportVar;
				bModified = true;
			}
		}
		return {modified: bModified, globalNameConvertedToAMDExport};
	},
	/**
	 * Modifies the AST by using SapUiDefineCall#addDependency
	 * @param {SapUiDefineCall} defineCall
	 * @param {string} moduleName, the module to add e.g. a.b.c
	 * @param {string} cause
	 * @param {Reporter} reporter
	 * @return {{modified:boolean, path:string}}
	 */
	addDependency(
		defineCall: SapUiDefineCall,
		moduleName: string,
		cause: string,
		reporter: Reporter
	) {
		let bWasModified = false;
		if (defineCall && moduleName === defineCall.name) {
			reporter.report(ReportLevel.DEBUG, "  ignoring dependency to self");
			return {modified: bWasModified, path: defineCall.exportName};
		}

		if (defineCall && defineCall.dependencyArray) {
			const dependencyArrayIndex = defineCall
				.getAbsoluteDependencyPaths()
				.indexOf(moduleName);
			if (dependencyArrayIndex >= 0) {
				if (!this.dependencies[moduleName]) {
					this.dependencies[moduleName] = {
						local: this.defineCall.paramNames[dependencyArrayIndex],
						causes: [cause],
					};
				} else {
					if (
						this.dependencies[moduleName].causes.indexOf(cause) < 0
					) {
						this.dependencies[moduleName].causes.push(cause);
					}
				}
				return {
					modified: bWasModified,
					path: this.dependencies[moduleName].local,
				};
			}
		}

		if (!this.dependencies[moduleName]) {
			this.dependencies[moduleName] = {
				local: this.getLocalReference(moduleName),
				causes: [cause],
			};
			let paramName = this.dependencies[moduleName].local;
			if (
				/^jquery\.sap\./.test(moduleName) &&
				defineCall &&
				defineCall.dependencyArray
			) {
				defineCall.dependencyArray.elements.forEach(
					(mod: ESTree.Node, idx) => {
						if (
							paramName &&
							/^jquery\.sap\./.test(
								(mod as ESTree.Literal).value.toString()
							) &&
							idx < defineCall.paramNames.length
						) {
							paramName = null;
							this.dependencies[moduleName].local =
								defineCall.paramNames[idx];
							reporter.report(
								ReportLevel.DEBUG,
								" using " +
									this.dependencies[moduleName].local +
									" (" +
									(mod as ESTree.Literal).value +
									") for jquery import " +
									moduleName
							);
						}
					}
				);
			}
			reporter.report(
				ReportLevel.DEBUG,
				"  add import " +
					this.dependencies[moduleName].local +
					" <= " +
					moduleName +
					"" +
					(paramName ? "" : " (hidden)")
			);
			bWasModified = defineCall.addDependency(moduleName, paramName);
		} else {
			if (this.dependencies[moduleName].causes.indexOf(cause) < 0) {
				this.dependencies[moduleName].causes.push(cause);
			}
		}
		return {
			modified: bWasModified,
			path: this.dependencies[moduleName].local,
		};
	},
	findDependency(module: string) {
		if (this.dependencies[module]) {
			return this.dependencies[module].local;
		}
	},
	addDependencyUsage(moduleName: string, cause: string, reporter: Reporter) {
		if (this.defineCall && this.defineCall.dependencyArray.elements) {
			const dependencyIndex = this.defineCall
				.getAbsoluteDependencyPaths()
				.indexOf(moduleName);
			if (dependencyIndex >= 0) {
				if (!this.dependencies[moduleName]) {
					this.dependencies[moduleName] = {
						local: this.defineCall.paramNames[dependencyIndex],
						causes: [],
					};
				}
				if (this.dependencies[moduleName].causes.indexOf(cause) < 0) {
					this.dependencies[moduleName].causes.push(cause);

					reporter.report(
						ReportLevel.DEBUG,
						"  keep dependency to " +
							moduleName +
							" because " +
							cause +
							" is used"
					);
				}
			}
		}
	},
	removeUsedDependencies(importNames: string[]) {
		for (const module in this.dependencies) {
			if (this.dependencies[module].local) {
				if (importNames.indexOf(this.dependencies[module].local) >= 0) {
					importNames.splice(
						importNames.indexOf(this.dependencies[module].local),
						1
					);
				}
			}
		}
		return importNames;
	},
	/**
	 *
	 * @param module, e.g. "a/b/c"
	 */
	getLocalReference(module: string) {
		let candidate;
		if (/^jquery\.sap\./.test(module)) {
			candidate = "jQuery";
		} else {
			candidate = module.replace(/\//g, ".");
		}

		const aUsedParamNames = this.defineCall.paramNames.slice();
		aUsedParamNames.push("library");

		// ensure local reference does neither contain invalid characters nor is
		// a language keyword
		candidate = VariableNameCreator.getUniqueParameterName(
			aUsedParamNames,
			candidate
		);

		// if the library module from a different library is imported, add a
		// package to distinguish it more easily
		if (candidate === "mLibrary") {
			candidate = "mobileLibrary";
			candidate = VariableNameCreator.getUniqueParameterName(
				aUsedParamNames,
				candidate
			);
		}

		return candidate;
	},
	makeModuleName(ui5name) {
		if (/^jquery\.sap\./.test(ui5name)) {
			return ui5name;
		}
		return ui5name.replace(/\./g, "/");
	},
	isSafeLocation(path) {
		const oRegx =
			/^(?:AMD-factory|constructor|init|onInit|initCompositeSupport|onAfterRendering|onBeforeRendering)$/;
		return !path.scope || oRegx.test(path.scope.node.__classMethodName);
	},
	/**
	 * Returns whether AST was modified or whether path was pruned or not
	 * @param path
	 * @param config
	 * @param reporter
	 * @returns {{modified:boolean, pruned:boolean}}
	 */
	processJQuerySAPRequireCall(
		path,
		config,
		reporter: Reporter
	): {modified: boolean; pruned: boolean} {
		const result = {modified: false, pruned: false};
		const requireCall = path.value;
		// reporter.report(ReportLevel.DEBUG, "require contained in method: " +
		// path.scope.node.__classMethodName);
		const safeLocation = this.isSafeLocation(path);
		let count = requireCall.arguments.length;
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		requireCall.arguments.forEach(arg => {
			if (arg.type === Syntax.Literal && typeof arg.value === "string") {
				const modName = that.makeModuleName(arg.value);
				if (
					that.isSafeModule(modName, config) ||
					safeLocation ||
					!config.onlySafeReplacements
				) {
					const modified = that.addDependency(
						that.defineCall,
						modName,
						undefined,
						reporter
					).modified;
					if (modified) {
						result.modified = true;
					}
					count--;
				}
			}
		});
		if (count === 0) {
			reporter.report(
				ReportLevel.DEBUG,
				"  transformed to dependencies: jQuery.sap.require(" +
					getArgumentName(path.value) +
					")",
				path.value.loc
			);
			result.pruned = true;
			result.modified = true;
			path.prune();
		} else {
			// TODO rename to sap.ui.requireSync()
			reporter.report(
				ReportLevel.DEBUG,
				"  partially transformed to dependencies jQuery.sap.require(" +
					getArgumentName(path.value) +
					")",
				path.value.loc
			);
		}
		return result;
	},
	async resolveSymbol(name, apiInfo) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		// look in the API summary for the symbol
		return apiInfo.getSymbol(name).then(symbol => {
			// reporter.report(ReportLevel.DEBUG, "looking for "+name+":",
			// symbol);
			if (symbol) {
				// HACK: sap/ui/Global defines sap.ui, therefore it needs to be
				// excluded
				if (symbol.symbol && symbol.symbol.module === "sap/ui/Global") {
					return undefined;
				}

				// HACK: ui5loader defines sap.ui.define, therefore it needs to
				// be excluded
				else if (
					symbol.member &&
					symbol.member.module === "ui5loader"
				) {
					return undefined;
				}
				// HACK: avoid resolution sap/ui/Device.browser.msie as
				// browser.msie
				else if (symbol.symbol.module === "sap/ui/Device") {
					if (symbol.member) {
						return undefined;
					}
					return {
						symbol: symbol.symbol,
						module: symbol.symbol.module,
						export: "",
						member: symbol.symbol.export,
					};
				} else if (/jQuery\.sap\./.test(name)) {
					// reporter.report(ReportLevel.DEBUG, symbol);
					return {
						symbol: symbol.symbol,
						module: symbol.symbol.module,
						export: "",
						member:
							symbol.symbol.export +
							(symbol.member ? "." + symbol.member.name : ""),
					};
				}

				if (symbol.member && !symbol.member.module) {
					// symbol has member information, but member has no own
					// module, use export info of symbol
					return {
						symbol: symbol.symbol,
						module: symbol.symbol.module,
						export: symbol.symbol.export,
						member:
							symbol.symbol.export === undefined
								? undefined
								: symbol.member.name,
					};
				} else if (symbol.member && symbol.member.module) {
					// symbol has member information and member has own module
					// information, use it
					return {
						symbol: symbol.symbol,
						module: symbol.member.module,
						export: symbol.member.export,
					};
				} else {
					// symbol has no member information, use export info of
					// symbol
					return {
						symbol: symbol.symbol,
						module: symbol.symbol.module,
						export: symbol.symbol.export,
					};
				}
			}
			if (that.defineCall) {
				// search known imports as a fallback
				const moduleGuess = name.replace(/\./g, "/");
				if (that.defineCall.getParamNameByImport(moduleGuess)) {
					return {
						module: moduleGuess,
						export: "", // default export
					};
				}
				// or is it a self-reference to the current module?
				if (that.defineCall.name === moduleGuess) {
					return {
						module: moduleGuess,
						export: "", // default export
					};
				}
			}
			return undefined;
		});

		// reporter.report(ReportLevel.DEBUG, "name not found " + origName);
	},

	/**
	 * Checks whether it is 'safe' to add a static dependency to the given
	 * module.
	 *
	 * This safety check should avoid that dependencies are made static although
	 * they better should remain dynamic.
	 *
	 * As we don't have a good cost function for dependencies, this
	 * implementation just checks the trivial stuff:
	 *  - dependencies that already exists (self, existing dependencies) are
	 * safe
	 *  - dependencies from a control to its renderer are safe
	 *  - dependencies to modules that are defined in
	 * <code>config.basicModules</code> are safe
	 *  - dependencies to libraries are 'safe'
	 * @param {string} moduleName
	 * @param {object} config
	 * @returns {boolean} whether it is 'safe' to add a static dependency to the given module
	 */
	isSafeModule(moduleName, config) {
		if (this.defineCall) {
			// a reference to the current module itself is always 'safe'
			if (this.defineCall.name && this.defineCall.name === moduleName) {
				return true;
			}
			// special UI5 rule: a reference to the renderer of current module
			// (control) is also 'safe'
			if (
				(this.defineCall.name &&
					this.defineCall.name + "Renderer" === moduleName) ||
				this.defineCall.name === moduleName + "Renderer"
			) {
				return true;
			}
			// when a module is already referenced, it is regarded as 'safe' as
			// well
			if (
				this.defineCall.dependencyArray &&
				this.defineCall
					.getAbsoluteDependencyPaths()
					.indexOf(moduleName) >= 0
			) {
				return true;
			}
		}
		if (
			config.basicModules &&
			config.basicModules.indexOf(moduleName) >= 0
		) {
			// reference to a configured 'safe' module
			return true;
		}
		// libraries are assumed to be 'safe'
		return /\/library$/.test(moduleName);
	},
	isJQuerySAPDeclareCall(node: ESTree.Node) {
		const bMemberCall =
			node.type === Syntax.CallExpression &&
			(node as ESTree.CallExpression).callee.type ===
				Syntax.MemberExpression &&
			((node as ESTree.CallExpression).callee as ESTree.MemberExpression)
				.object.type === Syntax.MemberExpression &&
			(
				(
					(node as ESTree.CallExpression)
						.callee as ESTree.MemberExpression
				).object as ESTree.MemberExpression
			).object.type === Syntax.Identifier;
		if (bMemberCall) {
			const member = (node as ESTree.CallExpression)
				.callee as ESTree.MemberExpression;
			const ident = (member.object as ESTree.MemberExpression)
				.object as ESTree.Identifier;
			const bJQuery = ident.name === "jQuery" || ident.name === "$";
			if (bJQuery) {
				const call = (member.object as ESTree.MemberExpression)
					.property;
				return (
					call.type === Syntax.Identifier &&
					(call as ESTree.Identifier).name === "sap" &&
					member.property.type === Syntax.Identifier &&
					(member.property as ESTree.Identifier).name === "declare"
				);
			}
		}
		return false;
	},
	isJQuerySAPRequireCall(node: ESTree.Node) {
		const bMemberCall =
			node.type === Syntax.CallExpression &&
			(node as ESTree.CallExpression).callee.type ===
				Syntax.MemberExpression &&
			((node as ESTree.CallExpression).callee as ESTree.MemberExpression)
				.object.type === Syntax.MemberExpression &&
			(
				(
					(node as ESTree.CallExpression)
						.callee as ESTree.MemberExpression
				).object as ESTree.MemberExpression
			).object.type === Syntax.Identifier;
		if (bMemberCall) {
			const member = (node as ESTree.CallExpression)
				.callee as ESTree.MemberExpression;
			const ident = (member.object as ESTree.MemberExpression)
				.object as ESTree.Identifier;
			const bJQuery = ident.name === "jQuery" || ident.name === "$";
			if (bJQuery) {
				const call = (member.object as ESTree.MemberExpression)
					.property;
				return (
					call.type === Syntax.Identifier &&
					(call as ESTree.Identifier).name === "sap" &&
					member.property.type === Syntax.Identifier &&
					(member.property as ESTree.Identifier).name === "require"
				);
			}
		}
		return false;
	},
	isExtendCall(node: ESTree.Node) {
		return (
			node &&
			node.type === Syntax.CallExpression &&
			(node as ESTree.CallExpression).callee.type ===
				Syntax.MemberExpression &&
			((node as ESTree.CallExpression).callee as ESTree.MemberExpression)
				.property.type === Syntax.Identifier &&
			(
				(
					(node as ESTree.CallExpression)
						.callee as ESTree.MemberExpression
				).property as ESTree.Identifier
			).name === "extend" &&
			(node as ESTree.CallExpression).arguments.length > 0 &&
			(node as ESTree.CallExpression).arguments[0].type ===
				Syntax.Literal &&
			typeof (
				(node as ESTree.CallExpression).arguments[0] as ESTree.Literal
			).value === "string"
		);
	},
	getObjectName(node: ESTree.Node): string {
		if (
			node.type === Syntax.MemberExpression &&
			(node as ESTree.MemberExpression).property.type ===
				Syntax.Identifier
		) {
			return (
				this.getObjectName((node as ESTree.MemberExpression).object) +
				"." +
				(
					(node as ESTree.MemberExpression)
						.property as ESTree.Identifier
				).name
			);
		} else if (node.type === Syntax.Identifier) {
			return (node as ESTree.Identifier).name;
		}
		return undefined;
	},
	isIIFE(node: ESTree.Node) {
		if (
			node.type === Syntax.ExpressionStatement &&
			(node as ESTree.ExpressionStatement).expression.type ===
				Syntax.CallExpression &&
			(
				(node as ESTree.ExpressionStatement)
					.expression as ESTree.CallExpression
			).callee.type === Syntax.FunctionExpression
		) {
			const oCallExpression = (node as ESTree.ExpressionStatement)
				.expression as ESTree.CallExpression;
			return [oCallExpression.callee, oCallExpression.arguments];
		}
		return undefined;
	},
	isIIFEWithoutArguments(node: ESTree.Node) {
		const iife = this.isIIFE(node);
		return iife && iife[1].length === 0;
	},
	/**
	 * Excludes use strict, jQuery.sap.declare and jQuery.sap.require calls
	 * @param nodes
	 */
	getRelevantNodes(nodes: ESTree.Node[]) {
		return nodes.filter(node => {
			// use strict is filtered out
			if (this.containsUseStrict(node)) {
				return false;
				// jQuery.sap.require is filtered out
			} else if (
				node.type === Syntax.ExpressionStatement &&
				this.isJQuerySAPRequireCall(
					(node as ESTree.ExpressionStatement).expression
				)
			) {
				return false;
				// jQuery.sap.declare is filtered out
			} else if (
				node.type === Syntax.ExpressionStatement &&
				this.isJQuerySAPDeclareCall(
					(node as ESTree.ExpressionStatement).expression
				)
			) {
				return false;
			}
			return true;
		});
	},
	containsUseStrict(node: ESTree.ExpressionStatement) {
		return (
			node &&
			node.type === Syntax.ExpressionStatement &&
			node.expression.type === Syntax.Literal &&
			(node.expression as ESTree.Literal).value === "use strict"
		);
	},
	/**
	 *
	 * @param path
	 * @param defineCall
	 * @return {boolean} whether or not the specified path is part of the define calls body (same level)
	 */
	isModuleBodyStatement(path, defineCall) {
		return defineCall.factory.body.body.includes(path);
	},
	isStaticGlobal(path, reporter: Reporter) {
		// identify left-most part of member expression
		let candidate = path.value;
		while (
			candidate.type === Syntax.MemberExpression &&
			!candidate.computed
		) {
			candidate = candidate.object;
		}

		// if it is an identifier, check whether it belongs to the global scope
		if (candidate.type === Syntax.Identifier) {
			const scope = path.scope.lookup(candidate.name);
			// reporter.report(ReportLevel.DEBUG, "looking up " + candidate.name
			// + " result in scope " + scope);
			// reporter.report(ReportLevel.DEBUG, scope);
			if (scope && scope.isGlobal) {
				reporter.report(
					ReportLevel.DEBUG,
					"**** found in global scope: " + candidate.name,
					path.value.loc
				);
			}
			return !scope || scope.isGlobal;
		}
		return false;
	},
	isRHSOfInstanceOf(path) {
		return (
			path.parent.node.type === Syntax.BinaryExpression &&
			path.parent.node.operator === "instanceof" &&
			path.parent.node.right === path.value
		);
	},
	isJQueryMember(node: ESTree.Node) {
		let candidate = node;
		while (
			candidate.type === Syntax.MemberExpression &&
			!(candidate as ESTree.MemberExpression).computed
		) {
			candidate = (candidate as ESTree.MemberExpression).object;
		}
		return (
			node.type === Syntax.MemberExpression &&
			candidate.type === Syntax.Identifier &&
			(candidate as ESTree.Identifier).name === "jQuery"
		);
		// TODO resolve name
	},
};

/**
 *
 * @param ast
 * @returns {string[]}
 */
function findVariableDeclarationNames(ast): string[] {
	const aVariableNames: string[] = [];
	recast.visit(ast, {
		visitVariableDeclarator(path) {
			const node = path.value;
			if (node.id.type === Syntax.Identifier) {
				aVariableNames.push((node.id as ESTree.Identifier).name);
			}
			this.traverse(path);
		},
	});
	return aVariableNames;
}

/**
 * Iterates over ast nodes to check whether certain node typs match the imports.
 * If a match was found, the import is removed from the list.
 *
 * @param amdCleanerUtilInstance amdCleanerUtilInstance
 */
function identifyUnusedImports(amdCleanerUtilInstance) {
	const aImportParamNames =
		amdCleanerUtilInstance.defineCall.paramNames.slice();
	amdCleanerUtilInstance.removeUsedDependencies(aImportParamNames);

	// find used variables and remove them from aImportParamNames
	recast.visit(amdCleanerUtilInstance.defineCall.factory.body.body, {
		visitIdentifier(path) {
			const node = path.value;
			const parent = path.parent.node;
			if (
				(parent.type === Syntax.MemberExpression &&
					node === parent.object) ||
				// children of BYFIELD only when identifier is the
				// first in the sequence
				(parent.type === Syntax.Property && node === parent.value) ||
				// children of NAMEDVALUE only if identifier is not
				// the NAME
				(parent.type === Syntax.LabeledStatement &&
					node !== parent.label) ||
				(parent.type === Syntax.ContinueStatement &&
					node !== parent.label) ||
				(parent.type === Syntax.BreakStatement &&
					node !== parent.label) ||
				(parent.type !== Syntax.MemberExpression &&
					parent.type !== Syntax.Property &&
					parent.type !== Syntax.LabeledStatement &&
					parent.type !== Syntax.ContinueStatement &&
					parent.type !== Syntax.BreakStatement)
			) {
				// and children of
				// all other tokens
				const idx = aImportParamNames.indexOf(node.name);
				if (idx >= 0) {
					aImportParamNames.splice(idx, 1);
				}
			}
			this.traverse(path);
		},
	});
	return aImportParamNames;
}

/**
 *
 * @param aUnusedParamNames ["Filter", "Foo"]
 * @param amdCleanerUtilInstance {}
 * @param moduleName "my.foo.Bar"
 * @param reporter logging utility
 * @param modify comes from amdCleaner cfg
 * @param ast abstract syntax tree
 * @param oAnalysisResult Gathered information object for further analysis
 *
 * @return boolean whether or not the AST has been modified
 */
function removeUnusedDependencies(
	aUnusedParamNames: string[],
	amdCleanerUtilInstance,
	moduleName: string,
	reporter: Reporter,
	modify: boolean,
	ast: ESTree.Node,
	oAnalysisResult: {}
) {
	let bFileWasModified = false;
	aUnusedParamNames.forEach((unusedParamName: string) => {
		const importPath =
			amdCleanerUtilInstance.defineCall.getImportByParamName(
				unusedParamName
			); // e.g. "sap/ui/model/Filter"
		// check that import exists and that we didn't just
		// add it in this run Note: the tool might have
		// found a hidden dependency like sap/ui/core/Core
		// when sap.ui.getCore() is called Note: also don't
		// remove the library to which this module belongs
		// and don't remove thirdparty
		if (
			importPath &&
			!amdCleanerUtilInstance.dependencies[importPath] &&
			!amdCleanerUtilInstance.isLibraryFor(moduleName, importPath) &&
			!/sap\/ui\/thirdparty\//.test(importPath)
		) {
			reporter.report(
				ReportLevel.DEBUG,
				"Remove unused import " +
					importPath +
					" (" +
					unusedParamName +
					")"
			);
			if (modify) {
				const bWasRemoved =
					amdCleanerUtilInstance.defineCall.removeDependency(
						importPath,
						unusedParamName
					);
				bFileWasModified = bFileWasModified || bWasRemoved;
				reporter.report(
					Mod.ReportLevel.DEBUG,
					"Remove dependency",
					ast.loc
				);
			} else {
				reporter.storeFinding("remove dependency", ast.loc);
				oAnalysisResult["removeDependency"] =
					oAnalysisResult["removeDependency"] || [];
				oAnalysisResult["removeDependency"].push({
					module: importPath,
				});
			}
		}
	});
	return bFileWasModified;
}
