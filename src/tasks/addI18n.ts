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
import * as FileUtils from "../util/FileUtils";
import * as ESTree from "estree";
import * as path from "path";

import * as Mod from "../Migration";
import * as ASTUtils from "../util/ASTUtils";
import {ASTVisitor} from "../util/ASTVisitor";
import {SapUiDefineCall} from "../util/SapUiDefineCall";
import * as DiffOptimizer from "../util/whitespace/DiffOptimizer";
import {ModifyJSONContent} from "../util/content/ModifyJSONContent";
import {DiffStringOptimizeStrategy} from "../util/whitespace/DiffStringOptimizeStrategy";

//#endregion

interface AddI18nResult {
	defineCall: SapUiDefineCall;
	supportedLocalesModels?: string[];
	fallbackLocaleModels?: string;
	supportedLocalesApp?: string[];
	fallbackLocaleApp?: string;
	bundleUrlApp?: string;
	manifestPath: string;
	manifestContent: object;
	manifestContentString: string;
}

async function getFiles(sI18nFolder, fileName) {
	let supportedLocales: string[] = [];
	const bI18nFolderExists = await FileUtils.exists(sI18nFolder);
	if (bI18nFolderExists) {
		const listI18n = await FileUtils.fsReadDir(sI18nFolder);
		supportedLocales = supportedLocales.concat(
			listI18n.map(si18n => {
				if (si18n.includes("_")) {
					return si18n.substring(
						fileName.length + "_".length,
						si18n.lastIndexOf(".properties")
					);
				}
				return si18n.substring(
					fileName.length,
					si18n.lastIndexOf(".properties")
				);
			})
		);
	}
	const fallbackLocale: string = supportedLocales[0];
	return {
		supportedLocalesModels: supportedLocales,
		fallbackLocaleModels: fallbackLocale,
	};
}

async function analyse(
	args: Mod.AnalyseArguments
): Promise<AddI18nResult | undefined> {
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

	const sImportName = defineCall.getParamNameByImport(
		"sap/ui/core/UIComponent"
	);

	const isReturnStatement = (stmt: ESTree.ReturnStatement): boolean => {
		if (stmt.argument.type === Syntax.CallExpression) {
			if (stmt.argument.callee.type === Syntax.MemberExpression) {
				if (
					stmt.argument.callee.object.type === Syntax.Identifier &&
					stmt.argument.callee.property.type === Syntax.Identifier
				) {
					if (
						stmt.argument.callee.object.name === sImportName &&
						stmt.argument.callee.property.name === "extend"
					) {
						return true;
					}
				}
			}
		}
		return false;
	};

	const bAddI18n = true;
	let nameSpace = "";
	defineCall.factory.body.body.forEach(stmt => {
		if (stmt.type === Syntax.VariableDeclaration) {
			stmt.declarations.forEach(decl => {
				if (
					decl.id.type === Syntax.Identifier &&
					decl.init &&
					decl.init.type === Syntax.CallExpression &&
					decl.init.callee.type === Syntax.MemberExpression &&
					decl.init.callee.property.type === Syntax.Identifier &&
					decl.init.callee.object.type === Syntax.Identifier &&
					decl.init.callee.property.name === "extend" &&
					decl.init.callee.object.name === sImportName
				) {
					if (decl.init.arguments[0].type === Syntax.Literal) {
						nameSpace = decl.init.arguments[0].value.toString();
						nameSpace = nameSpace.substring(
							0,
							nameSpace.lastIndexOf(".Component")
						);
					}
				}
			});
		} else if (
			stmt.type === Syntax.ReturnStatement &&
			stmt.argument.type === Syntax.CallExpression
		) {
			if (
				isReturnStatement(stmt) &&
				stmt.argument.arguments[0].type === Syntax.Literal
			) {
				nameSpace = stmt.argument.arguments[0].value.toString();
				nameSpace = nameSpace.substring(
					0,
					nameSpace.lastIndexOf(".Component")
				);
			}
		}
	});

	const aFilePath2 = args.file.getFileName().split("/");
	aFilePath2.pop();
	const sFilePath = aFilePath2.join("/");

	const manifestPath = path.join(sFilePath, "manifest.json");
	// check if manifest.json exists
	const bManifestExists = await FileUtils.exists(manifestPath);
	let sI18nModelsFolder;
	let sI18nAppFolder;
	let manifestContent;
	let manifestContentString;
	let i18nAppValue;
	if (bManifestExists) {
		manifestContentString = await FileUtils.fsReadFile(
			manifestPath,
			"UTF-8"
		);
		manifestContent = JSON.parse(manifestContentString);

		i18nAppValue = getObject(manifestContent, ["sap.app", "i18n"]);
		if (i18nAppValue && typeof i18nAppValue === "string") {
			sI18nAppFolder = i18nAppValue;
		}

		// models section
		const i18nModelsConfig = getObject(manifestContent, [
			"sap.ui5",
			"models",
			"i18n",
		]);
		if (
			i18nModelsConfig &&
			i18nModelsConfig.type === "sap.ui.model.resource.ResourceModel" &&
			i18nModelsConfig.settings
		) {
			const bundleName = i18nModelsConfig.settings.bundleName; // "sap.f.cardsVisualTests.i18n.i18n"
			if (
				bundleName.startsWith(nameSpace) &&
				!i18nModelsConfig.settings.supportedLocales &&
				!i18nModelsConfig.settings.fallbackLocale
			) {
				sI18nModelsFolder = bundleName.substring(nameSpace.length);
			}
		}
	} else {
		return undefined;
	}

	if (!sI18nModelsFolder && !sI18nAppFolder) {
		return undefined;
	}

	const oResultObject: AddI18nResult = {
		defineCall,
		manifestPath,
		manifestContent,
		manifestContentString,
	};

	if (sI18nModelsFolder) {
		// sI18nFolder = i18n.i18n
		const split = sI18nModelsFolder.split(".");
		const fileName = split.pop();

		sI18nModelsFolder = path.join(sFilePath, split.join("/"));

		const {supportedLocalesModels, fallbackLocaleModels} = await getFiles(
			sI18nModelsFolder,
			fileName
		);
		oResultObject.supportedLocalesModels = supportedLocalesModels;
		oResultObject.fallbackLocaleModels = fallbackLocaleModels;
	}

	if (sI18nAppFolder) {
		// sI18nFolder = i18n/i18n.properties
		sI18nAppFolder = sI18nAppFolder.substring(
			0,
			sI18nAppFolder.lastIndexOf(".properties")
		);
		const split = sI18nAppFolder.split("/");
		const fileName = split.pop();

		sI18nAppFolder = path.join(sFilePath, split.join("/"));

		const {supportedLocalesModels, fallbackLocaleModels} = await getFiles(
			sI18nAppFolder,
			fileName
		);
		oResultObject.supportedLocalesApp = supportedLocalesModels;
		oResultObject.fallbackLocaleApp = fallbackLocaleModels;
		oResultObject.bundleUrlApp = i18nAppValue;
	}

	if (
		bAddI18n &&
		manifestContent &&
		(oResultObject.supportedLocalesModels.length > 0 ||
			oResultObject.supportedLocalesApp.length > 0)
	) {
		args.reporter.collect("addI18n", 1);
		args.reporter.storeFinding("Add i18n", defineCall.node.callee.loc);
		return oResultObject;
	} else {
		return undefined;
	}
}

function getObject(oObject, aNames) {
	aNames.forEach(sName => {
		if (oObject && oObject[sName] !== undefined) {
			oObject = oObject[sName];
		} else {
			oObject = undefined;
		}
	});
	return oObject;
}

async function migrate(args: Mod.MigrateArguments): Promise<boolean> {
	const result = args.analyseResult as AddI18nResult;

	const manifestContentString = result.manifestContentString;

	const manifestContent = ModifyJSONContent.create(manifestContentString);
	if (
		result.supportedLocalesModels &&
		result.supportedLocalesModels.length > 0
	) {
		manifestContent.add(["sap.ui5", "models", "i18n", "settings"], {
			supportedLocales: result.supportedLocalesModels,
			fallbackLocale: result.fallbackLocaleModels,
		});
	}
	if (result.supportedLocalesApp && result.supportedLocalesApp.length > 0) {
		manifestContent.replace(["sap.app", "i18n"], {
			bundleUrl: result.bundleUrlApp,
			supportedLocales: result.supportedLocalesApp,
			fallbackLocale: result.fallbackLocaleApp,
		});
	}
	await FileUtils.fsWriteFile(
		result.manifestPath,
		manifestContent.getContent(),
		"UTF-8"
	);

	return false;
}

/*
 * Exports
 */
const migration: Mod.Task = {
	description: "Add i18n",
	keywords: ["all", "add-i18n"],
	priority: 5,
	defaultConfig() {
		return Promise.resolve({});
	},
	analyse,
	migrate,
};
export = migration;
