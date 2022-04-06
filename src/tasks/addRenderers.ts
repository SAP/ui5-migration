/*
 *  Will introduce the each control's renderer as dependency for the control
 *
 * # Find Module (with define call)
 * # For each found module
 * ##  Check if there is a renderer (moduleName+"Renderer.js") available
 * ##  If so
 * ###   Add renderer dependency
 */

import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as path from "path";
import * as recast from "recast";
import {FileInfo} from "ui5-migration";

import * as Mod from "../Migration";
import {ReportLevel} from "../Migration";
import * as ASTUtils from "../util/ASTUtils";
import {ASTVisitor} from "../util/ASTVisitor";
import {SapUiDefineCall} from "../util/SapUiDefineCall";

const builders = recast.types.builders;

interface RendererDefinition {
	rendererDefined: boolean;
	classNode?: ESTree.ObjectExpression;
	moduleName?: string;
}

//#region utilities
function isRendererDefined(defineCall: SapUiDefineCall): RendererDefinition {
	let exportName: string;
	const classDefinitions: {[index: string]: ESTree.ObjectExpression} = {};
	const classNames: {[index: string]: string} = {};
	const rendererDefinedResult: RendererDefinition = {
		rendererDefined: false,
		moduleName: "",
	};
	if (!defineCall.factory) {
		return rendererDefinedResult;
	}

	// Pass 1: determine shortcut variables and module export (return value)
	defineCall.factory.body.body.forEach(stmt => {
		if (stmt.type === Syntax.VariableDeclaration) {
			stmt.declarations.forEach(decl => {
				if (
					decl.id.type === Syntax.Identifier &&
					decl.init &&
					decl.init.type === Syntax.CallExpression &&
					decl.init.callee.type === Syntax.MemberExpression &&
					decl.init.callee.property.type === Syntax.Identifier &&
					decl.init.callee.property.name === "extend" &&
					decl.init.arguments.length > 0 &&
					decl.init.arguments[0].type === Syntax.Literal &&
					typeof (decl.init.arguments[0] as ESTree.Literal).value ===
						"string"
				) {
					// console.log("found potential class definition %s = %s",
					// decl.id.name, decl.init.arguments[0].value);
					const classId = (decl.id as ESTree.Identifier).name;
					classNames[classId] = (
						decl.init.arguments[0] as ESTree.Literal
					).value.toString();
					classDefinitions[classId] = decl.init
						.arguments[1] as ESTree.ObjectExpression;
				}
			});
		} else if (stmt.type === Syntax.ReturnStatement) {
			if (stmt.argument && stmt.argument.type === Syntax.Identifier) {
				exportName = stmt.argument.name;
				if (
					classDefinitions[exportName] &&
					classDefinitions[exportName].properties
				) {
					rendererDefinedResult.classNode =
						classDefinitions[exportName];

					rendererDefinedResult.moduleName = classNames[exportName];

					classDefinitions[exportName].properties.forEach(prop => {
						const oProp = prop as ESTree.Property;
						if (
							oProp &&
							oProp.key &&
							(oProp.key as ESTree.Identifier).name === "renderer"
						) {
							rendererDefinedResult.rendererDefined = true;
						}
					});
				}
			}
		}
	});
	if (rendererDefinedResult.rendererDefined) {
		return rendererDefinedResult;
	}

	// Pass 2: identify class methods
	/* tslint:disable */
	defineCall.factory.body.body.forEach(stmt => {
		if (
			stmt.type === Syntax.ExpressionStatement &&
			stmt.expression.type === Syntax.AssignmentExpression &&
			exportName &&
			isPartOfMemberExpr(stmt.expression.left, exportName)
		) {
			if (
				stmt.expression.left.type === Syntax.MemberExpression &&
				stmt.expression.left.object.type === Syntax.MemberExpression &&
				stmt.expression.left.object.property.type ===
					Syntax.Identifier &&
				stmt.expression.left.object.property.name === "prototype" &&
				stmt.expression.left.property.type === Syntax.Identifier
			) {
				if (stmt.expression.left.property.name === "render") {
					rendererDefinedResult.rendererDefined = true;
				}
			}
		}
	});
	/* tslint:enable */
	return rendererDefinedResult;
}

function isPartOfMemberExpr(node: ESTree.Node, identifier: string): boolean {
	if (node.type === Syntax.MemberExpression) {
		if (node.object.type === Syntax.Identifier) {
			return node.object.name === identifier;
		}
		return isPartOfMemberExpr(node.object, identifier);
	}
	return false;
}

function lastPathElement(name: string): string {
	const p = name.lastIndexOf("/");
	return name.slice(p + 1);
}

async function doesModuleExist(
	finder: Mod.FileFinder,
	moduleName: string
): Promise<boolean> {
	return !!(await finder.findByPath(moduleName));
}

//#endregion

interface AddRenderersResult {
	defineCall: SapUiDefineCall;
	shouldAddRenderer: boolean;
	classNode?: ESTree.ObjectExpression;
}

async function analyse(
	args: Mod.AnalyseArguments
): Promise<AddRenderersResult | undefined> {
	const moduleName = args.file.getFileName();
	let astDefineCall: ESTree.CallExpression;

	const defineCalls = ASTUtils.findCalls(
		args.file.getAST(),
		SapUiDefineCall.isValidRootPath,
		args.visitor as ASTVisitor
	);
	if (defineCalls.length > 1) {
		args.reporter.report(
			Mod.ReportLevel.WARNING,
			"can't handle files with multiple modules"
		);
		return undefined;
	} else if (defineCalls.length === 1) {
		astDefineCall = defineCalls[0].value;
	} else {
		args.reporter.report(
			Mod.ReportLevel.WARNING,
			"could not find sap.ui.define call"
		);
		return undefined;
	}

	const defineCall = new SapUiDefineCall(
		astDefineCall,
		moduleName,
		args.reporter
	);

	if (!defineCall.factory) {
		args.reporter.report(
			Mod.ReportLevel.WARNING,
			"Invalid sap.ui.define call without factory"
		);
		return undefined;
	}

	const embeddedRenderer = isRendererDefined(defineCall);
	// use Renderer filename if the module is not part of the input files
	const rendererModuleName = moduleName + "Renderer.js";

	const rendererExists = await doesModuleExist(
		args.fileFinder,
		rendererModuleName
	);

	const sRendererParamName = getRendererParameterName(args.file);

	const sImportName = defineCall.getImportByParamName(sRendererParamName);
	const potentialImportPaths: string[] = [];
	potentialImportPaths.push("./" + sRendererParamName); // relative renderer path, e.g. "./MyRenderer"
	if (embeddedRenderer.moduleName) {
		potentialImportPaths.push(
			embeddedRenderer.moduleName.replace(/\./g, "/") + "Renderer"
		); // absolute renderer path, e.g. "test/MyRenderer"
	}

	const bRendererImportDefined = potentialImportPaths.includes(sImportName);

	if (
		rendererExists &&
		!embeddedRenderer.rendererDefined &&
		!bRendererImportDefined
	) {
		args.reporter.collect("missingRenderer", 1);
		args.reporter.storeFinding(
			"Missing Renderer",
			defineCall.node.callee.loc
		);
		return {
			defineCall,
			shouldAddRenderer: true,
			classNode: embeddedRenderer.classNode,
		};
	} else {
		return undefined;
	}
}

function getRendererParameterName(file: FileInfo) {
	return lastPathElement(file.getFileName()) + "Renderer";
}

async function migrate(args: Mod.MigrateArguments): Promise<boolean> {
	const result = args.analyseResult as AddRenderersResult;
	if (result && result.shouldAddRenderer) {
		const rendererModuleName = getRendererParameterName(args.file);
		if (result.defineCall.getImportByParamName(rendererModuleName)) {
			args.reporter.report(
				ReportLevel.WARNING,
				"Renderer already defined for " +
					args.file.getFileName() +
					". Renderer param name: " +
					rendererModuleName
			);
			return false;
		}
		const bRendererAdded = result.defineCall.addDependency(
			"./" + rendererModuleName,
			rendererModuleName
		);
		if (
			bRendererAdded &&
			result.classNode &&
			args.config &&
			args.config.addRendererField
		) {
			result.classNode.properties.push(
				builders.property(
					"init",
					builders.identifier("renderer"),
					builders.identifier(rendererModuleName)
				)
			);
		}

		return bRendererAdded;
	}
	return false;
}

/*
 * Exports
 */
const migration: Mod.Task = {
	description: "Add control renderers",
	keywords: ["all", "add-renderer-dependencies"],
	priority: 5,
	defaultConfig() {
		return Promise.resolve(
			require(path.join(
				__dirname,
				"../../defaultConfig/addRenderers.config.json"
			))
		);
	},
	analyse,
	migrate,
};
export = migration;
