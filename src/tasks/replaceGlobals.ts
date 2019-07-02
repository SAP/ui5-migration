/**
 *  Will check each source file (*.js) for using global jquery functions
 * replaces these functions with the appropriate module such as,
 *  @example
 *  jQuery.sap.assert(true)
 *  require(["sap/base/assert"], function(assert){assert(true);})"
 */
import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as fs from "graceful-fs";
import * as path from "path";
import {AnalysisResult, ASTReplaceable} from "ui5-migration";

import * as Mod from "../Migration";
import {Reporter} from "../reporter/Reporter";
import * as ASTUtils from "../util/ASTUtils";
import {ASTVisitor, NodePath, TNodePath} from "../util/ASTVisitor";
import * as CommentUtils from "../util/CommentUtils";
import {modifyModulesNotMatchingTargetVersion} from "../util/ConfigUtils";
import {SapUiDefineCall} from "../util/SapUiDefineCall";

function findVariableNames(ast: ESTree.Node, visitor: ASTVisitor): Set<string> {
	const aResults = new Set<string>();

	visitor.visit(ast, {
		visitIdentifier(identifierPath) {
			const oParentPath = identifierPath.parentPath;

			if (oParentPath.value.type !== "LabeledStatement" &&
				(oParentPath.value.type !== "Property" ||
				 (oParentPath.value as ESTree.Property).key ===
					 identifierPath.value) &&
				(oParentPath.value.type !== "MemberExpression" ||
				 (oParentPath.value as ESTree.MemberExpression).object ===
					 identifierPath.value)) {
				aResults.add((identifierPath.value as ESTree.Identifier).name);
			}
			this.traverse(identifierPath);
		}
	});

	return aResults;
}

function findUniqueName(
	favImportName: string, aExistingVariableNames: Set<string>): string {
	let sPotentialName = favImportName;
	const iMaxIterations = 100;
	let iCurIteration = 0;
	while (aExistingVariableNames.has(sPotentialName) &&
		   iCurIteration < iMaxIterations) {
		sPotentialName = favImportName + (iCurIteration++);
	}
	return sPotentialName;
}

function getDefineCall(
	oAst: ESTree.Node, sModuleName: string,
	reporter: Reporter): SapUiDefineCall|null {
	const defineCalls =
		ASTUtils.findCalls(oAst, SapUiDefineCall.isValidRootPath);
	if (defineCalls.length !== 1) {
		return null;
	}
	return new SapUiDefineCall(defineCalls[0].value, sModuleName, reporter);
}

/**
 *
 * @param oAST
 * @returns {string[]} sap,base,security,encodeXML
 */
function getCalleeExprParts(oAST: ESTree.Node): string[] {
	if (oAST.type === Syntax.MemberExpression) {
		return ASTUtils.getMemberExprParts(oAST);
	} else if (oAST.type === Syntax.Identifier) {
		return [ oAST.name ];
	} else if (oAST.type === Syntax.CallExpression) {
		return getCalleeExprParts(oAST.callee);
	} else {
		return [];
	}
}

function isCalleeMatchingModulesToReplace(
	oAST: ESTree.Node, oModuleTree: ModuleTree): boolean {
	const memberExprParts = getCalleeExprParts(oAST);
	if (!memberExprParts || memberExprParts.length === 0) {
		return false;
	}

	let oCurObject = oModuleTree;
	for (const memberExprPart of memberExprParts) {
		if (oCurObject.hasOwnProperty(memberExprPart)) {
			oCurObject = oCurObject[memberExprPart];
		} else {
			return "*" in oCurObject;
		}
	}
	return true;
}

function isGlobalContext(oNode: ESTree.Node): boolean {
	while (oNode) {
		if (oNode.type === Syntax.CallExpression) {
			return false;
		} else if (oNode.type === Syntax.ThisExpression) {
			return false;
		} else if (oNode.type === Syntax.MemberExpression) {
			if (oNode.property.type === "Identifier") {
				oNode = oNode.object;
			} else {  // e.g. arr[1].$() or map["something"].$()
				return false;
			}
		} else {
			return oNode.type !== Syntax.ArrayExpression;
		}
	}
	return false;
}

function isUsedAsExpression(oPath: TNodePath<ESTree.Identifier>): boolean {
	const parentType = oPath.parentPath.value.type;
	const name = oPath.name;
	return (
		(parentType === Syntax.CallExpression && name === "callee") ||
		(parentType === Syntax.VariableDeclarator && name === "init") ||
		(parentType === Syntax.Property && name === "value") ||
		(parentType === Syntax.AssignmentExpression && name === "value") ||
		(parentType === Syntax.LogicalExpression) ||
		(parentType === Syntax.BinaryExpression) ||
		(parentType === Syntax.UnaryExpression) ||
		(parentType === Syntax.ConditionalExpression));
}

function findCallsToReplace(
	oAST: ESTree.Node, oModuleTree: ModuleTree,
	visitor: ASTVisitor): NodePath[] {
	const oCalls: NodePath[] = [];

	visitor.visit(oAST, {
		visitMemberExpression(oPath) {
			if (isGlobalContext(oPath.value) &&
				isCalleeMatchingModulesToReplace(oPath.value, oModuleTree)) {
				oCalls.push(oPath);
				oPath.protect();
				return false;
			}
			this.traverse(oPath);
			return undefined;
		},
		// simple-identifier call (e.g. jQuery("xxx"))
		visitIdentifier(oPath) {
			if (isUsedAsExpression(oPath) &&
				isCalleeMatchingModulesToReplace(oPath.value, oModuleTree)) {
				oCalls.push(oPath);
				oPath.protect();
			}
			this.traverse(oPath);
		}
	});

	return oCalls;
}

function findImport(oObject: ImportMap, sName: string) {
	let iLevel = 0, bFound = true;

	while (bFound) {
		if (oObject[sName]) {
			break;
		} else if (oObject[sName + ".*"]) {
			sName += ".*";
			break;
		} else if (sName.indexOf(".") > 0) {
			sName = sName.substring(0, sName.lastIndexOf("."));
			iLevel++;
		} else {
			bFound = false;
		}
	}

	if (!bFound) {
		return undefined;
	}

	return { oldImportName : sName, import : oObject[sName], iLevel };
}

function findImportByCall(mImports: ImportMap, sName: string) {
	return findImport(mImports, sName);
}

/**
 * global variable to indicate that this replacement does not belong to a
 * module, e.g. jQuery.inArray
 * @type {string}
 */
const GLOBALS = "GLOBALS";

type ModuleTree = {
	[name: string]: ModuleTree
};

interface ImportConfig {
	newVariableName: string;
	newModulePath: string;
	errorComment: string;
}

interface ImportInfo {
	// e.g. for sap.ui.define(["sap.encoder"], function (j) { j.func(); })
	oldModule: string;		// jQuery.encoder
	newModule?: string;		// sap.encoder
	requireName?: string;   // j
	functionName?: string;  // func
	replacerName: string;
	hasToBeRequired: boolean;
	config: ImportConfig;
	parentName?: string;
	replacer?: string;
}
type ImportMap = {
	[oldImport: string]: ImportInfo
};

interface ReplaceGlobalsAnalysis extends AnalysisResult {
	defineCall: SapUiDefineCall;
	replaceCalls: Array<{
		callPath : NodePath; iLevel : number; import : ImportInfo;
		oldImportName : string;
	}>;
	removeRequires: string[];
	newRequires: Array<{
		modulePath : string; requireName : string; origRequireName : string;
	}>;
	addComments: Array<{ nodePath : NodePath; comment : string; }>;
}



function calculateImportName(oConfig: ImportConfig) {
	return oConfig.newVariableName ||
		(oConfig.newModulePath &&
		 oConfig.newModulePath.substring(
			 oConfig.newModulePath.lastIndexOf("/") + 1));
}

async function analyse(args: Mod.AnalyseArguments): Promise<AnalysisResult> {
	if (!args.config) {
		throw new Error("No configuration given");
	}
	const visitor = args.visitor as ASTVisitor || new ASTVisitor();

	const ast = args.file.getAST();

	// if there is no define call where dependency could be added -> resolve and
	// return
	const defineCall =
		getDefineCall(ast, args.file.getFileName(), args.reporter);
	if (!defineCall) {
		args.reporter.report(
			Mod.ReportLevel.TRACE, "could not find sap.ui.define call");
		return null;
	}

	if (!defineCall.factory) {
		args.reporter.report(
			Mod.ReportLevel.WARNING,
			"invalid sap.ui.define call without factory");
		return null;
	}


	const oConfig = args.targetVersion !== "latest" ?
		modifyModulesNotMatchingTargetVersion(
			args.config, args.targetVersion, { replacer : "LEAVE" },
			{ alias : "LEAVE", file : "tasks/helpers/replacers/LEAVE.js" }) :
		args.config;


	const oModuleTree: ModuleTree = {};


	// fill module tree
	for (const sKeyOldModule in oConfig.modules) {  // jquery.sap.global
		if (oConfig.modules.hasOwnProperty(sKeyOldModule)) {
			const oldImports = oConfig.modules[sKeyOldModule];

			for (const sOldImportName in
				 oldImports) {  // "jQuery.sap._loadJSResourceAsync"

				if (oldImports.hasOwnProperty(sOldImportName)) {
					const oldImport = oldImports[sOldImportName];

					let replacerName = oldImport.replacer;
					if (!replacerName) {
						replacerName = oldImport.functionName ?
							"Module" :
							"ModuleFunction";
					}

					// fill module tree
					let oCurObject = oModuleTree;
					sOldImportName.split(".").forEach(sPart => {
						if (!oCurObject[sPart]) {
							oCurObject[sPart] = {};
						}
						oCurObject = oCurObject[sPart];
					});
					if (replacerName === "Module") {
						oCurObject["*"] = {};
					}
				}
			}
		}
	}
	const aCallsToReplace = findCallsToReplace(ast, oModuleTree, visitor);
	args.reporter.collect("callsToReplace", aCallsToReplace.length);

	const mOldImports = {};
	for (const sKeyOldModule in oConfig.modules) {  // jquery.sap.global
		if (oConfig.modules.hasOwnProperty(sKeyOldModule)) {
			const oldImports = oConfig.modules[sKeyOldModule];
			for (const sOldImportName in
				 oldImports) {  // "jQuery.sap._loadJSResourceAsync"
				if (oldImports.hasOwnProperty(sOldImportName)) {
					mOldImports[sOldImportName] = oldImports[sOldImportName];
					mOldImports[sOldImportName].parentName = sKeyOldModule;
				}
			}
		}
	}

	const aVariableNamesToRemove = new Set<string>();
	Object.keys(oConfig.modules)
		.map(o => defineCall.getParamNameByImport(o))
		.forEach(function(s) {
			if (typeof s === "string") {
				aVariableNamesToRemove.add(s);
			}
		});


	// let aVariableNamesToKeep = new Set<string>();
	for (const oCallPath of aCallsToReplace) {
		const sCalleeName = getCalleeExprParts(oCallPath.value).join(".");
		const oResult = findImport(mOldImports, sCalleeName);
		if (oResult) {
			/*
	if (oResult.import && oResult.import.parentName === "GLOBALS") {
	const sImportName = getCalleeExprParts(oCallPath.value)[0];
	if(sImportName) {
	  let sImportPath =
	defineCall.getImportByParamName(sImportName);
	}
	}
	*/

			if (oResult.import && oResult.import.replacer === "LEAVE") {
				// const sCalleeName =
				// getCalleeExprParts(oCallPath.value).join(".").replace("$",
				// "jQuery");
				const sImportName =
					defineCall.getParamNameByImport(oResult.import.parentName);
				if (sImportName) {
					aVariableNamesToRemove.delete(sImportName);
				}
			}
		}
	}

	const aExistingVariableNames = findVariableNames(ast, visitor);
	aVariableNamesToRemove.forEach(function(s) {
		aExistingVariableNames.delete(s);
	});


	// find calls which leave variable name intact -> LEAVE


	const mImports: ImportMap = {};
	const mImportRequireNames:
		{ [newImport: string]: string } = {};  // new module to require name

	// Parse config
	for (const sKeyOldModule in oConfig.modules) {
		if (oConfig.modules.hasOwnProperty(sKeyOldModule)) {
			const oldImports = oConfig.modules[sKeyOldModule];
			for (const sOldImportName in oldImports) {
				if (oldImports.hasOwnProperty(sOldImportName)) {
					const oldImport = oldImports[sOldImportName];

					// find new variable name, e.g. serializeXML
					let newImportName = calculateImportName(oldImport);
					let hasToBeRequired = true;
					if (oldImport.newModulePath) {
						if (oldImport.newModulePath in mImportRequireNames) {
							// module is already a new requirement
							newImportName =
								mImportRequireNames[oldImport.newModulePath];
						} else {
							// check if module is already an import
							const p = defineCall.dependencyArray ?
								defineCall.dependencyArray.elements.findIndex(
									oArg => (oArg as ESTree.Literal).value ===
										oldImport.newModulePath) :
								-1;
							if (p < 0) {
								// add new import
								newImportName = findUniqueName(
									newImportName, aExistingVariableNames);
								aExistingVariableNames.add(newImportName);
								mImportRequireNames[oldImport.newModulePath] =
									newImportName;
							} else {
								// reuse import
								const sParamName = defineCall.paramNames[p];
								if (sParamName) {
									hasToBeRequired = false;
									newImportName = sParamName;
								}
							}
						}
					}

					// save all the import info
					let replacerName = oldImport.replacer;
					if (!replacerName) {
						replacerName = oldImport.functionName ?
							"Module" :
							"ModuleFunction";
					}
					mImports[sOldImportName] = {
						oldModule : sKeyOldModule,
						newModule : oldImport.newModulePath,
						requireName : newImportName,
						functionName : oldImport.functionName,
						replacerName,
						hasToBeRequired,
						config : oldImport
					};
				}
			}
		}
	}

	// replace with modules
	const analysis: ReplaceGlobalsAnalysis = {
		containsFindings : false,
		defineCall,
		addComments : [],
		newRequires : [],
		removeRequires : Object.keys(oConfig.modules),
		replaceCalls : []
	};

	for (const oCallPath of aCallsToReplace) {
		const sCallPathName = getCalleeExprParts(oCallPath.value).join(".");
		const sCalleeName = sCallPathName.replace("$", "jQuery");
		const oResult = findImportByCall(mImports, sCalleeName);

		if (oResult) {
			analysis.replaceCalls.push({
				callPath : oCallPath,
				iLevel : oResult.iLevel,
				oldImportName : sCalleeName,
				import : oResult.import
			});

			// Format error message
			let sInfoMsg;
			if (oResult.import.newModule) {
				sInfoMsg = `Replace global call with "${
					oResult.import.newModule.replace(/\//g, ".")}"`;
			} else if (oResult.import.functionName) {
				sInfoMsg =
					`Replace global call with "${oResult.import.functionName}"`;
			} else {
				sInfoMsg =
					`Deprecated call of type ${oResult.import.replacerName}`;
			}
			args.reporter.report(
				Mod.ReportLevel.TRACE, sInfoMsg, oCallPath.value.loc);

			analysis.containsFindings = true;
			const sActionMsg = `Found call to replace "${sCallPathName}"`;
			args.reporter.report(
				Mod.ReportLevel.TRACE, sActionMsg, oCallPath.value.loc);

			// schedule new module to be imported
			if (oResult.import.newModule && oResult.import.hasToBeRequired) {
				const p = analysis.newRequires.findIndex(
					i => i.modulePath === oResult.import.newModule);
				if (p < 0) {
					analysis.newRequires.push({
						modulePath : oResult.import.newModule,
						requireName : oResult.import.requireName,
						origRequireName :
							calculateImportName(oResult.import.config)
					});
				}
			}

			// schedule old module to be deleted
			if (oResult.import.oldModule !== GLOBALS) {
				const p =
					analysis.removeRequires.indexOf(oResult.import.oldModule);
				if (p < 0) {
					analysis.removeRequires.push(oResult.import.oldModule);
				}
			}

		} else if (args.config.comments) {
			analysis.addComments.push({
				nodePath : oCallPath,
				comment : args.config.comments.unhandledReplacementComment
			});
		}
	}

	return analysis;
}

async function migrate(args: Mod.MigrateArguments): Promise<boolean> {
	if (!args.config || !args.analyseResult) {
		return false;
	}
	const visitor = args.visitor || new ASTVisitor();
	const analyseResult = (args.analyseResult) as ReplaceGlobalsAnalysis;

	// Loader replacer functions
	const mReplacerFuncs:
		{ [name: string]:
			  ASTReplaceable } = {};  // TODO: Add function interface
	if (!args.config.replacers) {
		throw new Error("No replacers configured");
	}
	for (const replacerName in args.config.replacers) {
		if (args.config.replacers.hasOwnProperty(replacerName)) {
			// TODO: Move and translate the replaceGlobals modules!
			const modulePath =
				path.join(__dirname, "..", args.config.replacers[replacerName]);
			mReplacerFuncs[replacerName] = require(modulePath);
		}
	}

	const aUsedNewModules = new Set<string>();
	const aDoNotRemoveModules = new Set<string>();
	let bFileModified = false;
	let bFileIgnored = false;

	// Replace calls
	for (const oReplace of analyseResult.replaceCalls) {
		let oNodePath: NodePath = oReplace.callPath;
		for (let i = 0; i < oReplace.iLevel; i++) {
			oNodePath = visitor.visitSingle(oNodePath, "object");
		}

		// Try to replace the call
		try {
			const oResult =
				mReplacerFuncs[oReplace.import.replacerName].replace(
					oNodePath, oReplace.import.requireName,
					oReplace.import.functionName, oReplace.oldImportName,
					oReplace.import.config);

			const wasFullyHandled = oResult && oResult.modified === true;
			const skipDependency = oResult && oResult.addDependency === false;

			const sCall = getCalleeExprParts(oNodePath.value).join(".");
			// if new module to add matches old module to remove
			if (oReplace.import.newModule === oReplace.import.oldModule &&
				!skipDependency) {
				aDoNotRemoveModules.add(oReplace.import.oldModule);
				aUsedNewModules.add(oReplace.import.newModule);
			} else if (wasFullyHandled) {
				// call was fully handled, do not do anything related to it
				aDoNotRemoveModules.add(oReplace.import.oldModule);
			} else if (!skipDependency) {
				aUsedNewModules.add(oReplace.import.newModule);
			}
			args.reporter.report(
				Mod.ReportLevel.TRACE, `Replaced call "${sCall}"`,
				oNodePath.value.loc);

			args.reporter.collect("replacementsPerformed", 1);
			if (oNodePath.parentPath.value.type === Syntax.MemberExpression &&
				oNodePath.parentPath.value.property.type ===
					Syntax.Identifier &&
				oNodePath.parentPath.value.property.name) {
				args.reporter.collect(
					oNodePath.parentPath.value.property.name, 1);
			}

			bFileModified = true;
		} catch (e) {
			args.reporter.report(
				Mod.ReportLevel.DEBUG,
				"ignored element: " + oReplace.oldImportName,
				oNodePath.value.loc);
			args.reporter.report(
				Mod.ReportLevel.ERROR, "Error: " + e.message,
				oNodePath.value.loc);
			args.reporter.collect("replacementsIgnored", 1);
			aDoNotRemoveModules.add(oReplace.import.oldModule);

			bFileIgnored = true;

			const sComment = oReplace.import.config.errorComment ||
				(args.config.comments &&
				 args.config.comments.failedReplacementComment);
			if (sComment) {
				CommentUtils.addComment(oNodePath, sComment);
				bFileModified = true;
			}
		}
	}

	// add comments
	for (const oComment of analyseResult.addComments) {
		if (CommentUtils.addComment(oComment.nodePath, oComment.comment)) {
			bFileModified = true;
		}
	}

	// add/remove dependencies
	const newRequires = analyseResult.newRequires.filter(
		r => aUsedNewModules.has(r.modulePath));
	const removeRequires =
		analyseResult.removeRequires.filter(r => !aDoNotRemoveModules.has(r));


	const aRequireNames = removeRequires.map(
		s => analyseResult.defineCall.getParamNameByImport(s));

	for (const oRequire of newRequires) {
		const bWillBeRemoved =
			aRequireNames.indexOf(oRequire.origRequireName) > -1;
		const iIndex = analyseResult.defineCall.paramNames.indexOf(
			oRequire.origRequireName);
		if (bWillBeRemoved && iIndex > -1) {
			if (analyseResult.defineCall.modifyDependency(
					iIndex, oRequire.modulePath, oRequire.origRequireName)) {
				args.reporter.report(
					Mod.ReportLevel.TRACE,
					`Modify dependency "${oRequire.modulePath}" named "${
						oRequire.origRequireName}"`,
					analyseResult.defineCall.factory.loc);
				bFileModified = true;
			}
		} else if (analyseResult.defineCall.addDependency(
					   oRequire.modulePath, oRequire.requireName)) {
			args.reporter.report(
				Mod.ReportLevel.TRACE,
				`Add dependency "${oRequire.modulePath}" named "${
					oRequire.requireName}"`,
				analyseResult.defineCall.factory.loc);
			bFileModified = true;
		}
	}

	for (const sModule of removeRequires) {
		if (analyseResult.defineCall.removeDependency(sModule)) {
			args.reporter.report(
				Mod.ReportLevel.TRACE, `Remove dependency "${sModule}"`,
				analyseResult.defineCall.factory.loc);
			bFileModified = true;
		}
	}

	if (bFileModified) {
		args.reporter.collect("fileModified", 1);
	}

	if (bFileIgnored) {
		args.reporter.collect("fileIgnored", 1);
	}

	return bFileModified;
}

const replaceGlobals: Mod.Task = {
	description :
		"Replaces usage of global jQuery functions with module imports",
	keywords : [ "all", "replace-globals" ],
	priority : 5,
	defaultConfig() {
		return Promise.resolve(JSON.parse(fs.readFileSync(
			path.join(
				__dirname, "../../../defaultConfig/replaceGlobals.config.json"),
			"utf8")));
	},
	postTasks : [ "variable-name-prettifier" ],
	// TODO: add config schema

	analyse,
	migrate
};
export = replaceGlobals;
