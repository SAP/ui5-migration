const semver = require('semver');

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
    targetVersion === 'latest' ||
    !version ||
    (semver.valid(targetVersion) &&
      (semver.valid(version) || semver.validRange(version)) &&
      semver.satisfies(targetVersion, version))
  );
}

/**
 * Filters out modules with versions which don't match the target version
 *
 * @param {object} oModules - modules to filter e.g. {"jQuery modifiers": { "jQqery.sap.byId": {version: "1.2.x"} } }
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
        oModules[sKey][key] = Object.assign(oModules[sKey][key], targetObject);
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
    throw new Error('No config supplied for modification');
  }
  const oModifiedConfig = JSON.parse(JSON.stringify(oConfig));
  if (Object.keys(oConfig).length === 0 || !targetVersion) {
    return oModifiedConfig;
  }
  oModifiedConfig['modules'] = filterVersionMatches(
    oModifiedConfig['modules'],
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
  targetVersion,
  targetModuleConfig: object,
  targetReplacer?: { alias: string; file: string }
) {
  if (!oConfig) {
    throw new Error('No config supplied for modification');
  }
  const oModifiedConfig = JSON.parse(JSON.stringify(oConfig));
  if (Object.keys(oConfig).length === 0 || !targetVersion) {
    return oModifiedConfig;
  }
  oModifiedConfig['modules'] = modifyNotMatchingModules(
    oModifiedConfig['modules'],
    targetVersion,
    targetModuleConfig
  );
  if (targetReplacer && !oModifiedConfig['replacers'][targetReplacer.alias]) {
    oModifiedConfig['replacers'][targetReplacer.alias] = targetReplacer.file;
  }
  return oModifiedConfig;
}
