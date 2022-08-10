/* eslint no-prototype-builtins: "off" */
/**
 *  Will check each source file (*.js) for using global jquery functions
 * replaces these functions with the appropriate module such as,
 *  @example
 *  jQuery.sap.assert(true)
 *  require(["sap/base/assert"], function(assert){assert(true);})"
 */
import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as path from "path";
import {ASTReplaceable} from "ui5-migration";

import {
	EMPTY_FINDER_RESULT,
	Extender,
	Finder,
	FinderResult,
} from "../dependencies";
import * as Mod from "../Migration";
import {Reporter} from "../reporter/Reporter";
import * as ASTUtils from "../util/ASTUtils";
import {ASTVisitor, NodePath} from "../util/ASTVisitor";
import * as CommentUtils from "../util/CommentUtils";
import {removeModulesNotMatchingTargetVersion} from "../util/ConfigUtils";
import {SapUiDefineCall} from "../util/SapUiDefineCall";

function getDefineCall(
	oAst: ESTree.Node,
	sModuleName: string,
	reporter: Reporter
) {
	const defineCalls = ASTUtils.findCalls(
		oAst,
		SapUiDefineCall.isValidRootPath
	);
	let defineCall = null;

	if (defineCalls.length > 1) {
		return undefined;
	} else if (defineCalls.length === 1) {
		defineCall = defineCalls[0].value;
	} else {
		return undefined;
	}

	return new SapUiDefineCall(defineCall, sModuleName, reporter);
}

function mapToFound(oPath: NodePath, oFound: FoundReplacement): FoundCall {
	return {
		module: oFound.module,
		configName: oFound.configName,
		callPath: oPath,
		iLevel: 0,
		config: oFound.oModuleInner,
		importObj: {
			replacerName: oFound.oModuleInner.replacer,
			extenderName: oFound.oModuleInner.extender,
			newModulePath: oFound.oModuleInner.newModulePath,
		},
	};
}

const visit = function (
	analysis: Analysis,
	oModuleTree: {},
	finders: {[name: string]: Finder},
	reporter: Reporter,
	defineCall: SapUiDefineCall
) {
	return function (oPath) {
		const aFound = isFoundInConfig(
			oPath.value,
			oPath,
			oModuleTree,
			finders,
			defineCall
		);
		if (aFound.length > 0) {
			analysis.replaceCalls = analysis.replaceCalls.concat(
				aFound.map(mapToFound.bind(null, oPath))
			);
			const msg = aFound.map(oFound => oFound.newModulePath).join(", ");
			reporter.storeFinding(
				`Found missing dependency: ${msg}`,
				oPath.value.loc
			);

			analysis.newRequires = analysis.newRequires.concat(
				aFound.map((oFound: FoundReplacement) => {
					return {modulePath: oFound.newModulePath};
				})
			);
			oPath.protect();
			return false;
		}
		this.traverse(oPath);
		return undefined;
	};
};

function findCallsToReplace(
	oAST: ESTree.Node,
	defineCall: SapUiDefineCall,
	oModuleTree: {},
	finders: {[name: string]: Finder},
	visitor: ASTVisitor,
	reporter: Reporter
): Analysis {
	// replace with modules
	const analysis: Analysis = {
		addComments: [],
		defineCall,
		newRequires: [],
		removeRequires: [],
		replaceCalls: [],
	};
	const aStack: ESTree.Node[] = [oAST];

	while (aStack.length > 0) {
		visitor.visit(aStack.shift(), {
			visitMemberExpression: visit(
				analysis,
				oModuleTree,
				finders,
				reporter,
				defineCall
			),
			// simple-identifier call (e.g. jQuery("xxx"))
			visitCallExpression: visit(
				analysis,
				oModuleTree,
				finders,
				reporter,
				defineCall
			),
			// new expression, e.g. new UriParameters()
			visitNewExpression: visit(
				analysis,
				oModuleTree,
				finders,
				reporter,
				defineCall
			),
			visitBinaryExpression: visit(
				analysis,
				oModuleTree,
				finders,
				reporter,
				defineCall
			),
			visitVariableDeclarator: visit(
				analysis,
				oModuleTree,
				finders,
				reporter,
				defineCall
			),
			visitIdentifier: visit(
				analysis,
				oModuleTree,
				finders,
				reporter,
				defineCall
			),
			visitLogicalExpression: visit(
				analysis,
				oModuleTree,
				finders,
				reporter,
				defineCall
			),
		});
	}

	return analysis;
}

/**
 * Uses the finders to check if the given node contains valid findings.
 * Returns the findings.
 * @param oNode
 * @param oNodePath
 * @param oModuleTree
 * @param finder
 * @param defineCall
 */
function isFoundInConfig(
	oNode: ESTree.Node,
	oNodePath: NodePath,
	oModuleTree: {
		[index: string]: {
			[index: string]: {finder: string; newModulePath: string};
		};
	},
	finder: {[name: string]: Finder},
	defineCall: SapUiDefineCall
): FoundReplacement[] {
	const aCalls = [];
	for (const sModule in oModuleTree) {
		if (oModuleTree.hasOwnProperty(sModule)) {
			const oModule = oModuleTree[sModule];
			for (const sModuleInner in oModule) {
				if (oModule.hasOwnProperty(sModuleInner)) {
					const oModuleInner = oModule[sModuleInner];
					const oFinder: Finder = finder[oModuleInner.finder];
					const oResult: FinderResult = oFinder.find(
						oNode,
						oModuleInner,
						sModuleInner,
						defineCall
					);
					if (oResult && oResult !== EMPTY_FINDER_RESULT) {
						aCalls.push({
							module: sModule,
							configName: oResult.configName,
							oModuleInner,
							newModulePath: oModuleInner.newModulePath,
						});
					}
				}
			}
		}
	}
	return aCalls;
}

interface FoundReplacement {
	module: string;
	configName: string;
	oModuleInner: {
		replacer?: string;
		extender?: string;
		finder?: string;
		newModulePath?: string;
	};
	newModulePath: string;
}

interface ConfigObject {
	replacerName?: string;
	extenderName?: string;
	newModulePath?: string;
	newVariableName?: string;
	functionName?: string;
}

interface FoundCall {
	module: string;
	iLevel: number;
	configName: string;
	config: ConfigObject;
	callPath: NodePath;
	importObj: ConfigObject;
}

interface Analysis {
	defineCall: SapUiDefineCall;
	replaceCalls: FoundCall[];
	removeRequires: string[];
	newRequires: Array<{modulePath: string; requireName?: string}>;
	addComments: Array<{nodePath: NodePath; comment: string}>;
}

/**
 * Throws an error if finder cannot be found for a module in the config
 * @param {object} config module config
 * @param {[key: string]: Finder} mFinderFuncs alias to Finder object lookup map
 */
function checkFindersInConfig(
	config: object,
	mFinderFuncs: {[key: string]: Finder}
) {
	for (const sModule in config) {
		if (config.hasOwnProperty(sModule)) {
			const oModule = config[sModule];
			for (const sModuleInner in oModule) {
				if (oModule.hasOwnProperty(sModuleInner)) {
					const oModuleInner = oModule[sModuleInner];
					const oFinder: Finder = mFinderFuncs[oModuleInner.finder];
					if (!oFinder) {
						throw new Error(
							`Failed to find Finder for "${oModuleInner.finder}"`
						);
					}
				}
			}
		}
	}
}

async function analyse(args: Mod.AnalyseArguments): Promise<{} | undefined> {
	if (!args.config) {
		throw new Error("No configuration given");
	}
	const visitor = (args.visitor as ASTVisitor) || new ASTVisitor();

	const ast = args.file.getAST();

	// if there is no define call where dependency could be added -> resolve and
	// return
	const defineCall = getDefineCall(
		ast,
		args.file.getFileName(),
		args.reporter
	);
	if (!defineCall) {
		args.reporter.report(
			Mod.ReportLevel.TRACE,
			"could not find sap.ui.define call for " + args.file.getFileName()
		);
		return undefined;
	} else if (!defineCall.factory) {
		args.reporter.report(
			Mod.ReportLevel.WARNING,
			"unsupported sap.ui.define without factory found for " +
				args.file.getFileName()
		);
		return undefined;
	}
	const mFinderFuncs: {[name: string]: Finder} = {}; // TODO: Add function interface

	if (!args.config.finders) {
		throw new Error("No finders configured");
	}

	for (const finderName in args.config.finders) {
		if (args.config.finders.hasOwnProperty(finderName)) {
			const modulePath = path.join(
				__dirname,
				"..",
				args.config.finders[finderName]
			);
			mFinderFuncs[finderName] = require(modulePath.replace(/.js$/, ""));
		}
	}

	checkFindersInConfig(args.config.modules, mFinderFuncs);

	const oConfig =
		args.targetVersion !== "latest"
			? removeModulesNotMatchingTargetVersion(
					args.config,
					args.targetVersion
			  )
			: args.config;

	const oAnalysis = findCallsToReplace(
		ast,
		defineCall,
		oConfig.modules,
		mFinderFuncs,
		visitor,
		args.reporter
	);
	args.reporter.collect("replacementsFound", oAnalysis.replaceCalls.length);
	return oAnalysis;
}

async function migrate(args: Mod.MigrateArguments): Promise<boolean> {
	if (!args.config || !args.analyseResult) {
		args.reporter.report(
			Mod.ReportLevel.ERROR,
			"no config or nothing to analyze"
		);
		return false;
	}
	const visitor = args.visitor || new ASTVisitor();
	const analyseResult = args.analyseResult as Analysis;

	// Loader replacer functions
	const mReplacerFuncs: {[name: string]: ASTReplaceable} = {}; // TODO: Add function interface
	const mExtenderFuncs: {[name: string]: Extender} = {}; // TODO: Add function interface
	if (!args.config.replacers) {
		throw new Error("No replacers configured");
	}
	for (const replacerName in args.config.replacers) {
		if (args.config.replacers.hasOwnProperty(replacerName)) {
			const modulePath = path.join(
				__dirname,
				"..",
				args.config.replacers[replacerName]
			);
			mReplacerFuncs[replacerName] = require(modulePath.replace(
				/.js$/,
				""
			));
		}
	}

	if (!args.config.extenders) {
		throw new Error("No extenders configured");
	}
	for (const extenderName in args.config.extenders) {
		if (args.config.extenders.hasOwnProperty(extenderName)) {
			const modulePath = path.join(
				__dirname,
				"..",
				args.config.extenders[extenderName]
			);
			mExtenderFuncs[extenderName] = require(modulePath.replace(
				/.js$/,
				""
			));
		}
	}

	let bFileModified = false;
	let bFileIgnored = false;

	// Replace calls : FoundCall
	for (const oReplace of analyseResult.replaceCalls) {
		let oNodePath: NodePath = oReplace.callPath;
		for (let i = 0; i < oReplace.iLevel; i++) {
			oNodePath = visitor.visitSingle(oNodePath, "object");
		}

		// Try to replace the call
		try {
			// retrieve variable name from existing import and use it as name argument of replace call
			let variableNameToUse = oReplace.config.newVariableName;
			if (oReplace.config.newModulePath) {
				variableNameToUse =
					analyseResult.defineCall.getParamNameByImport(
						oReplace.config.newModulePath
					) || variableNameToUse;
			}
			mReplacerFuncs[oReplace.importObj.replacerName].replace(
				oNodePath,
				variableNameToUse,
				oReplace.config.functionName,
				oReplace.module,
				oReplace.config
			);

			// modify define call
			const oExtender: Extender =
				mExtenderFuncs[oReplace.importObj.extenderName];
			oExtender.extend(analyseResult.defineCall, oReplace.config);

			args.reporter.collect("replacementsPerformed", 1);
			if (
				oNodePath.parentPath.value.type === Syntax.MemberExpression &&
				oNodePath.parentPath.value.property.type ===
					Syntax.Identifier &&
				oNodePath.parentPath.value.property.name
			) {
				args.reporter.collect(
					oNodePath.parentPath.value.property.name,
					1
				);
			}
			bFileModified = true;
		} catch (e) {
			args.reporter.report(
				Mod.ReportLevel.WARNING,
				"ignored element: " + oReplace.configName,
				oNodePath.value.loc
			);
			args.reporter.report(Mod.ReportLevel.ERROR, e, oNodePath.value.loc);
			args.reporter.collect("replacementsIgnored", 1);

			bFileIgnored = true;
			if (args.config.comments) {
				CommentUtils.addComment(
					oNodePath,
					args.config.comments.failedReplacementComment
				);
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
	if (bFileModified) {
		args.reporter.collect("fileModified", 1);
	}

	if (bFileIgnored) {
		args.reporter.collect("fileIgnored", 1);
	}
	return bFileModified;
}

const replaceGlobals: Mod.Task = {
	description:
		"Checks usage of jQuery function extensions and ensures module imports are correct",
	keywords: ["all", "fix-jquery-plugin-imports"],
	priority: 5,
	defaultConfig() {
		return Promise.resolve(
			require(path.join(
				__dirname,
				"../../defaultConfig/addMissingDependencies.config.json"
			))
		);
	},
	// TODO: add config schema

	analyse,
	migrate,
};

export = replaceGlobals;
