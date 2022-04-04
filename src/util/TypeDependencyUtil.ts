"use strict";

import {ConsoleReporter, Reporter, ReportLevel} from "../Migration";
import {SapUiDefineCall} from "./SapUiDefineCall";
import * as ESTree from "estree";
import * as ASTUtils from "./ASTUtils";
import {ASTVisitor} from "./ASTVisitor";
import * as Mod from "../Migration";
import {APIInfo} from "./APIInfo";

const recast = require("recast");
const Syntax = require("esprima").Syntax;

const builders = recast.types.builders;

/**
 *
 * @param name
 * @param {APIInfo} apiInfo
 * @return {Promise<object|undefined>} resolves with the symbol if it is a module within a library otherwise <code>undefined</code>
 */
async function getModuleDefinedInLibrary(name: string, apiInfo: APIInfo) {
	return apiInfo.getSymbol(name).then(oApiSymbol => {
		// check if enum is within apiInfo
		// check the resource if it is coming from a library
		// --> import path und resource
		const oSymbol = oApiSymbol && oApiSymbol.symbol;
		if (!oSymbol) {
			return undefined;
		}

		if (
			oSymbol.module &&
			oSymbol.export &&
			/\/library/.test(oSymbol.module)
		) {
			return oSymbol;
		}

		return undefined;
	});
}

/**
 *
 * @param paramNames existing param names, ["Button", "library", "Action"]
 * @param module library which should be added, e.g. "sap/ui/layout/library"
 */
function getUniqueLibraryName(paramNames: string[], module: string) {
	const aSplitted = module.split("/");

	let candidate = aSplitted.pop();

	while (candidate && paramNames.includes(candidate)) {
		if (aSplitted.length === 0) {
			throw new Error("cannot find candidate for new name");
		}
		const prevSegment = aSplitted.pop();
		candidate =
			prevSegment + candidate[0].toUpperCase() + candidate.substring(1);
	}
	return candidate;
}

export enum ProcessingMode {
	PARALLEL = "parallel",
	SEQUENTIAL = "sequential",
}

/**
 *
 * @param {object} ast abstract syntax tree
 * @param {string} moduleName plain module name (file name including the path)
 * @param {ASTVisitor} visitor configuration
 * @param {APIInfo} apiInfo api info
 * @param {boolean} modify whether or not to modify the AST
 * @param {Reporter} reporter
 * @param {ProcessingMode} mode mode how it is processed
 * @returns Promise {{ast: *, dependencies: *, oAnalysisResult: *}}
 */
export async function fixTypeDependency(
	ast: ESTree.Node,
	moduleName: string,
	visitor: ASTVisitor,
	apiInfo: APIInfo,
	modify = true,
	reporter: Reporter = new ConsoleReporter(ReportLevel.INFO),
	mode = ProcessingMode.PARALLEL
) {
	let astDefineCall: ESTree.CallExpression;

	const defineCalls = ASTUtils.findCalls(
		ast,
		SapUiDefineCall.isValidRootPath,
		visitor
	);
	if (defineCalls.length > 1) {
		reporter.report(
			Mod.ReportLevel.WARNING,
			"can't handle files with multiple modules"
		);
		return Promise.resolve({modified: false});
	} else if (defineCalls.length === 1) {
		astDefineCall = defineCalls[0].value;
	} else {
		reporter.report(
			Mod.ReportLevel.WARNING,
			"could not find sap.ui.define call"
		);
		return Promise.resolve({modified: false});
	}

	const defineCall = new SapUiDefineCall(astDefineCall, moduleName, reporter);
	if (!defineCall.dependencyArray) {
		reporter.report(
			Mod.ReportLevel.TRACE,
			"sap.ui.define call without dependency array"
		);
		return Promise.resolve({modified: false});
	}
	if (!defineCall.factory) {
		reporter.report(
			Mod.ReportLevel.WARNING,
			"invalid sap.ui.define call without factory"
		);
		return Promise.resolve({modified: false});
	}
	const aPromises: Array<Promise<{}>> = [];
	defineCall.dependencyArray.elements.slice().forEach(depObj => {
		if (depObj.type === Syntax.Literal) {
			const dep = (depObj as ESTree.Literal).value.toString();
			const sDepInvocationName = dep.replace(/\//g, ".");
			const pAddPromise = getModuleDefinedInLibrary(
				sDepInvocationName,
				apiInfo
			).then(oSymbol => {
				if (!oSymbol) {
					return false;
				}

				reporter.collect("Found missing module", 1);
				reporter.collect(
					"Added library dependency: " + oSymbol.module,
					1
				);
				reporter.storeFinding(
					"Found missing module",
					(depObj as ESTree.Literal).loc
				);
				if (modify) {
					// get param name of the library
					let localRef = defineCall.getParamNameByImport(
						oSymbol.module
					);
					if (!localRef) {
						const sLibraryParamName = getUniqueLibraryName(
							defineCall.paramNames,
							oSymbol.module
						);
						// add new add dependency library
						defineCall.addDependency(
							oSymbol.module,
							sLibraryParamName
						);
						localRef = defineCall.getParamNameByImport(
							oSymbol.module
						);
					}

					// get the previously used variable name for the
					// enum
					const enumRef = defineCall.getParamNameByImport(dep);

					// delete the original enum dependency
					defineCall.removeDependency(dep);

					// add new variable for the enum
					const variableDeclaration = builders.variableDeclaration(
						"var",
						[
							builders.variableDeclarator(
								builders.identifier(enumRef),
								builders.memberExpression(
									builders.identifier(localRef),
									builders.identifier(oSymbol.export)
								)
							),
						]
					);
					variableDeclaration.comments =
						variableDeclaration.comments || [];
					variableDeclaration.comments.push({
						type: "Line",
						value: " shortcut for " + dep.replace(/\//g, "."),
						leading: true,
					});
					defineCall.prependStatementToFactory(variableDeclaration);
					return true;
				}

				return false;
			});
			aPromises.push(pAddPromise);
		}
	});
	let oRePromise = Promise.resolve([]);
	if (mode === ProcessingMode.PARALLEL) {
		oRePromise = Promise.all(aPromises);
	} else if (mode === ProcessingMode.SEQUENTIAL) {
		aPromises.forEach(oPromise => {
			oRePromise = oRePromise.then(aResults => {
				return oPromise.then(oResult => {
					aResults.push(oResult);
					return aResults;
				});
			});
		});
	}

	return oRePromise.then(aResults => {
		const bFileWasModified = aResults.some(oResult => {
			return oResult;
		});
		const oAnalysisResult = Object.create(null);
		return {
			modified: bFileWasModified,
			ast,
			dependencies: [],
			// for the analyze task modify is false therefore return
			// AnalysisResult
			oAnalysisResult: modify ? undefined : oAnalysisResult,
		};
	});
}
