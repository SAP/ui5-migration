"use strict";

import * as Mod from "../Migration";
import * as LoaderUtils from "../util/LoaderUtils";
import * as path from "path";
import {Reporter} from "../Migration";
import {ReportLevel} from "../Migration";

const typeDependencyUtil = require("../util/TypeDependencyUtil");
const apiInfo = require("../util/APIInfo");

/**
 * creates an APIInfo from the given config
 * @param config
 * @param reporter sed for logging and for creating a report at the end
 * @param {string} targetVersion
 * @return {Promise<APIInfo>}
 */
async function createApiInfo(
	config,
	reporter: Reporter,
	targetVersion: string
): Promise<{}> {
	const oApi = {};
	const oApiResources = {};
	let apiVersion;

	const aPromises = [];
	if (config.api) {
		Object.keys(config.api).forEach(sKey => {
			aPromises.push(
				LoaderUtils.fetchResource(config.api[sKey])
					.then(oResult => {
						oApi[sKey] = {symbols: oResult["symbols"].slice()};
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
	const apiInfo = await createApiInfo(
		args.config,
		args.reporter,
		args.targetVersion
	);
	const oResult = await typeDependencyUtil.fixTypeDependency(
		args.file.getAST(),
		args.file.getFileName(),
		args.visitor,
		apiInfo,
		false,
		args.reporter,
		args.config.executionMode
	);

	// pass the api info through to the migrate function (re-use)
	oResult.apiInfo = apiInfo;
	return oResult;
}

/**
 * Modifies the source code
 * @param args
 */
async function migrate(args: Mod.MigrateArguments): Promise<boolean> {
	const apiInfo = args.analyseResult.apiInfo;
	return typeDependencyUtil
		.fixTypeDependency(
			args.file.getAST(),
			args.file.getFileName(),
			args.visitor,
			apiInfo,
			true,
			args.reporter,
			args.config.executionMode
		)
		.then(oResult => {
			return oResult.modified;
		});
}

/*
 * Exports AmdCleaner
 */
const fixTypeDependency: Mod.Task = {
	description:
		"Removes invalid dependency of enums and uses library reference instead.",
	keywords: ["all", "fix-type-dependencies"],
	priority: 5,
	defaultConfig() {
		return Promise.resolve(
			require(path.join(
				__dirname,
				"../../defaultConfig/fixTypeDependency.config.json"
			))
		);
	},
	analyse,
	migrate,
};
export = fixTypeDependency;
