const semver = require("semver");

/**
 * Validates if target version and min version matches.
 * Succeeds if latest was given as target version
 *
 * @param {string} targetVersion - target UI5 version e.g. 1.62.0
 * @param {string} version - version to match e.g. 1.58.x, 1.60.1
 * @returns {boolean} true if affected, otherwise false
 */
export function matchesVersion(targetVersion, version): boolean {
	return (
		!targetVersion ||
		targetVersion === "latest" ||
		!version ||
		(semver.valid(targetVersion) &&
			(semver.valid(version) || semver.validRange(version)) &&
			semver.satisfies(targetVersion, version))
	);
}

/**
 *
 * @param version
 * @param baselineVersion
 * @returns {boolean} whether or not version is higher than baselineVersion
 */
export function hasHigherVersion(version: string, baselineVersion: string) {
	if (version === "latest") {
		return true;
	}
	return semver.gt(
		semver.minVersion(version),
		semver.minVersion(baselineVersion)
	);
}

/**
 * Filters out modules with versions which don't match the target version
 *
 * @param {object} oModules - modules to filter e.g. {"jQuery modifiers": { "jQuery.sap.byId": {version: "1.2.x"} } }
 * @param {string} targetVersion - target version
 * @returns {object}
 */
export function filterVersionMatches(
	oModules: object,
	targetVersion: string
): object {
	const oModulesToApply = {};

	Object.keys(oModules).forEach(sKey => {
		const filteredModules = Object.keys(oModules[sKey])
			.filter(
				key =>
					!oModules[sKey][key].version ||
					matchesVersion(targetVersion, oModules[sKey][key].version)
			)
			.reduce((accumulator, key) => {
				accumulator[key] = oModules[sKey][key];
				return accumulator;
			}, {});

		if (Object.keys(filteredModules).length > 0) {
			oModulesToApply[sKey] = filteredModules;
		}
	});

	return oModulesToApply;
}

/**
 * Identifies matched replacers in config.module block
 *
 * @param {object} oModules modules to filter
 * @param {string} targetVersion target version to check
 */
export function filterMatchedModules(
	oModules: object,
	targetVersion: string
): string[] {
	const aModulesToApply = [];
	Object.keys(oModules).forEach(sKey => {
		const aMatchedReplacers = Object.keys(oModules[sKey])
			.filter(
				key =>
					!oModules[sKey][key].version ||
					matchesVersion(targetVersion, oModules[sKey][key].version)
			)
			.reduce((replacerAccumulator, key) => {
				replacerAccumulator.push(oModules[sKey][key].functionName);
				return replacerAccumulator;
			}, []);

		aModulesToApply.push(...aMatchedReplacers);
	});
	return aModulesToApply;
}

/**
 * Identifies matched replacers in config.module block
 *
 * @param {object} oModule modules to filter
 * @param {string} targetVersion target version to check
 * @param {object} targetObject which is merged with the matching modules
 */
export function modifyNotMatchingModules(
	oModule: object,
	targetVersion: string,
	targetObject: object
): string[] {
	const oModules = JSON.parse(JSON.stringify(oModule));
	Object.keys(oModules).forEach(sKey => {
		Object.keys(oModules[sKey])
			.filter(
				key =>
					oModules[sKey][key].version &&
					!matchesVersion(targetVersion, oModules[sKey][key].version)
			)
			.forEach(key => {
				oModules[sKey][key] = Object.assign(
					oModules[sKey][key],
					targetObject
				);
			});
	});
	return oModules;
}

/**
 * Modifies config and retrieves a config valid for the given UI5 version
 *
 * @param {object} oConfig config to modify
 * @param {string} targetVersion UI5 target version e.g. 1.58.0
 * @returns {object} copy of the config with modules filtered by targetVersion
 */
export function removeModulesNotMatchingTargetVersion(
	oConfig: object,
	targetVersion
) {
	if (!oConfig) {
		throw new Error("No config supplied for modification");
	}
	const oModifiedConfig = JSON.parse(JSON.stringify(oConfig));
	if (Object.keys(oConfig).length === 0 || !targetVersion) {
		return oModifiedConfig;
	}
	oModifiedConfig["modules"] = filterVersionMatches(
		oModifiedConfig["modules"],
		targetVersion
	);
	return oModifiedConfig;
}

/**
 * Modifies config and retrieves a config valid for the given UI5 version
 *
 * @param {object} oConfig config to modify
 * @param {string} targetVersion UI5 target version e.g. 1.58.0
 * @param {object} targetModuleConfig module config which gets merged with not matching modules
 * @param {object} [targetReplacer] replacer config which gets applied to the replacers
 * @returns {object} copy of the config with modules filtered by targetVersion
 */
export function modifyModulesNotMatchingTargetVersion(
	oConfig: object,
	targetVersion: string,
	targetModuleConfig: object,
	targetReplacer?: {alias: string; file: string}
) {
	if (!oConfig) {
		throw new Error("No config supplied for modification");
	}
	const oModifiedConfig = JSON.parse(JSON.stringify(oConfig));
	if (Object.keys(oConfig).length === 0 || !targetVersion) {
		return oModifiedConfig;
	}
	oModifiedConfig["modules"] = modifyNotMatchingModules(
		oModifiedConfig["modules"],
		targetVersion,
		targetModuleConfig
	);
	if (targetReplacer && !oModifiedConfig["replacers"][targetReplacer.alias]) {
		oModifiedConfig["replacers"][targetReplacer.alias] =
			targetReplacer.file;
	}
	return oModifiedConfig;
}

/**
 * Merges the same modules with different versions
 *
 * Before:
 * "modules": {
 *		"jquery.sap.script": {
 *			"jQuery.sap.extend@1.58.0": {
 *				"newModulePath": "sap/ui/thirdparty/jquery",
 *				"newVariableName": "jQuery",
 *				"functionName": "extend",
 *				"replacer": "jQueryExtend",
 *				"version": "^1.58.0"
 *			},
 *			"jQuery.sap.extend@1.60.0": {
 *				"newModulePath": "sap/base/util/merge",
 *				"newVariableName": "merge",
 *				"replacer": "mergeOrObjectAssign",
 *				"version": "1.60.0"
 *			}
 *		}
 *	}
 *
 * E.g. when using version "latest"
 * the object "jQuery.sap.extend@1.60.0" is copied to "jQuery.sap.extend"
 * which means that it is taken into account for replacements
 * After:
 * "modules": {
 *		"jquery.sap.script": {
 *			"jQuery.sap.extend": {
 *				"newModulePath": "sap/base/util/merge",
 *				"newVariableName": "merge",
 *				"replacer": "mergeOrObjectAssign",
 *				"version": "1.60.0"
 *			},
 *			"jQuery.sap.extend@1.58.0": {
 *				"newModulePath": "sap/ui/thirdparty/jquery",
 *				"newVariableName": "jQuery",
 *				"functionName": "extend",
 *				"replacer": "jQueryExtend",
 *				"version": "^1.58.0"
 *			},
 *			"jQuery.sap.extend@1.60.0": {
 *				"newModulePath": "sap/base/util/merge",
 *				"newVariableName": "merge",
 *				"replacer": "mergeOrObjectAssign",
 *				"version": "1.60.0"
 *			}
 *		}
 *	}
 *
 * @param {object} oConfig config to modify
 * @param {string} targetVersion UI5 target version e.g. 1.58.0
 * @returns {object} a copy of the config with closest versions to targetVersion of modules for
 * keys which have an '@' in the name.
 * E.g. keys ["jQuery.sap.extend@1.60.0", "jQuery.sap.extend@1.58.0"]
 * will be ["jQuery.sap.extend@1.60.0", "jQuery.sap.extend@1.58.0", "jQuery.sap.extend"] where "jQuery.sap.extend" is a copy of the closest matching version,
 * e.g. "1.60.0" for targetVersion "latest"
 */
export function mergeModulesWithMultipleVersions(
	oConfig: object,
	targetVersion: string
) {
	// validate input parameters
	if (!oConfig) {
		throw new Error("No config supplied for modification");
	}

	const oModifiedConfig = JSON.parse(JSON.stringify(oConfig));
	if (Object.keys(oConfig).length === 0 || !targetVersion) {
		return oModifiedConfig;
	}

	// create a copy of modules
	const oModules = JSON.parse(JSON.stringify(oModifiedConfig["modules"]));
	Object.keys(oModules).forEach(sModuleGroup => {
		// get all keys with multiple versions
		const multiVersionModuleKeys = Object.keys(
			oModules[sModuleGroup]
		).filter(sModule => sModule.includes("@"));
		if (multiVersionModuleKeys.length > 0) {
			// group multiple version modules by module
			/**
			 *
			 * {
			 *     "jQuery.sap.extend": [
			 *     		"jQuery.sap.extend@1.58.0",
			 *     		"jQuery.sap.extend@1.60.0"
			 *     	]
			 * }
			 */
			const groupByModule = {};
			multiVersionModuleKeys.forEach(sKey => {
				const sModule = sKey.split("@")[0];
				if (!groupByModule[sModule]) {
					groupByModule[sModule] = [];
				}
				groupByModule[sModule].push(sKey);
			});

			//get highest version
			const closestModules = [];
			Object.keys(groupByModule).forEach(sModule => {
				// sModule, e.g. "jQuery.sap.extend"
				let localClosest;

				groupByModule[sModule].forEach(sKey => {
					const version = oModules[sModuleGroup][sKey].version;
					// e.g. ^1.58.0

					// check if version is a valid candidate (e.g. is not bigger than targetVersion)
					if (
						targetVersion === "latest" ||
						matchesVersion(targetVersion, version)
					) {
						// get closest to the targetVersion
						if (
							!localClosest ||
							hasHigherVersion(version, localClosest.version)
						) {
							localClosest = {
								key: sKey,
								sModule,
								version,
							};
						}
					}
				});
				if (localClosest) {
					closestModules.push(localClosest);
				}
			});

			// replace modules with closest ones
			closestModules.forEach(high => {
				oModules[sModuleGroup][high.sModule] =
					oModules[sModuleGroup][high.key];
			});
		}
	});
	oModifiedConfig["modules"] = oModules;

	return oModifiedConfig;
}
