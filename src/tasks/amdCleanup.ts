"use strict";

import * as Mod from "../Migration";
import {Reporter, ReportLevel} from "../Migration";
import * as LoaderUtils from "../util/LoaderUtils";
import * as path from "path";

const amdCleanerUtil = require("../util/AmdCleanerUtil");
const apiInfo = require("../util/APIInfo");

/**
 * creates an APIInfo from the given config
 * @param {object} config
 * @param {object} reporter
 * @param {string} targetVersion
 * @return {Promise<APIInfo>}
 */
async function createApiInfo(
	config: {
		api: {};
		apiResources: object[];
		apiVersion: string;
		rootPath: string;
	},
	reporter: Reporter,
	targetVersion: string
): Promise<{}> {
	const oApi = {};
	const oApiResources = {};
	let apiVersion;

	const aPromises: Array<Promise<void>> = [];
	if (config.api) {
		Object.keys(config.api).forEach(sKey => {
			aPromises.push(
				LoaderUtils.fetchResource(config.api[sKey])
					.then(oResult => {
						oApi[sKey] = oResult;
					})
					.catch(e => {
						reporter.report(
							ReportLevel.ERROR,
							"failed to load " + sKey + ", error: " + e
						);
					})
			);
		});
	}
	if (config.apiResources) {
		Object.keys(config.apiResources).forEach(sKey => {
			aPromises.push(
				LoaderUtils.fetchResource(config.apiResources[sKey])
					.then(oResult => {
						oApiResources[sKey] = oResult;
					})
					.catch(e => {
						reporter.report(
							ReportLevel.ERROR,
							"failed to load resources for " +
								sKey +
								", error: " +
								e
						);
					})
			);
		});
	}
	if (config.apiVersion) {
		aPromises.push(
			LoaderUtils.fetchResource(config.apiVersion)
				.then(oResult => {
					apiVersion = oResult;
				})
				.catch(e => {
					reporter.report(
						ReportLevel.ERROR,
						"failed to load " + config.apiVersion + ", error: " + e
					);
				})
		);
	}
	await Promise.all(aPromises);
	return apiInfo.create({
		mApi: oApi,
		oApiVersion: apiVersion,
		mApiIncludedResources: oApiResources,
		rootPath: config.rootPath,
		reporter,
		targetVersion,
	});
}

/**
 * Analyzes the source code and returns a Promise with the resulting changes
 * @param args
 * @return {Promise} resolving with the found changes
 */
async function analyse(args: Mod.AnalyseArguments): Promise<{}> {
	// TODO check instanceof args.config.api being APIInfo and pass it through
	// then
	const apiInfo = await createApiInfo(
		args.config,
		args.reporter,
		args.targetVersion
	);
	const pAnalysis = amdCleanerUtil.ui52amd(
		args.file.getAST(),
		args.file.getFileName(),
		args.file.getNamespace(),
		args.config.amd,
		apiInfo,
		false,
		args.reporter
	);

	return pAnalysis.then(oAnalysisResult => {
		const oAnalysis = oAnalysisResult.oAnalysisResult;
		if (oAnalysis) {
			let iReplacements = 0;
			iReplacements += countModifications(oAnalysis, "removeDependency");
			iReplacements += countModifications(oAnalysis, "remove-path");
			iReplacements += countModifications(oAnalysis, "addDependency");
			iReplacements += countModifications(oAnalysis, "addShortcut");
			iReplacements += countModifications(oAnalysis, "replace");
			iReplacements += countModifications(oAnalysis, "parentReplace");
			iReplacements += countModifications(oAnalysis, "body");
			iReplacements += countModifications(oAnalysis, "convertExport");
			iReplacements += countModifications(oAnalysis, "returnStatement");
			iReplacements += countModifications(oAnalysis, "globalExport");

			args.reporter.collect("replacementsFound", iReplacements);
			args.reporter.collect(
				"amdStructureCreated",
				countModifications(oAnalysis, "body")
			);
		}
		return oAnalysisResult;
	});
}

function countModifications(oAnalysis, sValue) {
	if (oAnalysis[sValue] && Array.isArray(oAnalysis[sValue])) {
		return oAnalysis[sValue].length;
	}
	return 0;
}

/**
 * Modifies the source code
 * @param args
 */
async function migrate(args: Mod.MigrateArguments): Promise<boolean> {
	const apiInfo = await createApiInfo(
		args.config,
		args.reporter,
		args.targetVersion
	);
	return amdCleanerUtil
		.ui52amd(
			args.file.getAST(),
			args.file.getFileName(),
			args.file.getNamespace(),
			args.config.amd,
			apiInfo,
			true,
			args.reporter
		)
		.then(oResult => {
			return oResult.modified;
		});
}

/*
 * Exports AmdCleaner
 */
const migration: Mod.Task = {
	description:
		"Remove global module invocations and add required dependencies.",
	defaultConfig() {
		return Promise.resolve(
			require(path.join(
				__dirname,
				"../../defaultConfig/AmdCleaner.config.json"
			))
		);
	},
	keywords: ["all", "apply-amd-syntax"],
	priority: 10,
	analyse,
	migrate,
};
export = migration;
