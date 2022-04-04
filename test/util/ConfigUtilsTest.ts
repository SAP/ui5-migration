import {
	filterMatchedModules,
	filterVersionMatches,
	matchesVersion,
	removeModulesNotMatchingTargetVersion,
} from "../../src/util/ConfigUtils";

const assert = require("assert");

describe("ConfigUtilsTest", () => {
	describe("matchesVersion: (happy path)", () => {
		it("Should succeed if valid version range was given", () => {
			assert(
				matchesVersion("1.3.1", "1.3.x"),
				"Target version and given version range match"
			);
		});

		it("Should succeed if valid version was given", () => {
			assert(
				matchesVersion("1.4.0", "^1.3.1"),
				"Target version and given version match"
			);
		});
	});
	describe("filterVersionMatches: (happy path)", () => {
		it("Should filter out modules for matching target version", () => {
			const oModules = {
				"Module Root": {
					"Module A": {
						functionName: "functionA",
						version: "^1.58.0",
					},
					"Module B": {
						functionName: "functionB",
						version: "^1.40.0",
					},
					"Module C": {
						functionName: "functionC",
						version: "^1.44.0",
					},
				},
			};

			assert.deepEqual(
				filterVersionMatches(oModules, "1.44.0"),
				{
					"Module Root": {
						"Module B": {
							functionName: "functionB",
							version: "^1.40.0",
						},
						"Module C": {
							functionName: "functionC",
							version: "^1.44.0",
						},
					},
				},
				"Filtered out modules with version older than the target version"
			);
		});
	});
	describe("filterMatchedReplacers: (happy path)", () => {
		it("Should filter out replacers for given modules config", () => {
			const oModules = {
				"Module Root": {
					"Module A": {
						functionName: "functionA",
						version: "^1.58.0",
					},
					"Module B": {
						functionName: "functionB",
						version: "^1.44.0",
					},
					"Module C": {
						functionName: "functionC",
						version: "^1.40.0",
					},
				},
			};

			const aFilteredMatches = filterMatchedModules(oModules, "1.44.0");
			assert.deepEqual(
				aFilteredMatches,
				["functionB", "functionC"],
				"Filtered out replacers where version doesn't match"
			);
		});
	});
	describe("adjustConfigForTargetVersion: (happy path)", () => {
		it("Should filter out replacers for given modules config", () => {
			const oInitialConfig = {
				modules: {
					"Module Root": {
						"Module A": {
							functionName: "functionA",
							version: "^1.58.0",
						},
						"Module B": {
							functionName: "functionB",
							version: "^1.40.0",
						},
						"Module C": {
							functionName: "functionC",
							version: "^1.44.0",
						},
					},
				},
				replacers: {
					functionA: "path/to/module/A",
					functionB: "path/to/module/B",
					functionC: "path/to/module/C",
				},
			};

			const oModifiedConfig = removeModulesNotMatchingTargetVersion(
				oInitialConfig,
				"1.40.0"
			);
			assert.deepEqual(
				oModifiedConfig,
				{
					modules: {
						"Module Root": {
							"Module B": {
								functionName: "functionB",
								version: "^1.40.0",
							},
						},
					},
					replacers: {
						functionA: "path/to/module/A",
						functionB: "path/to/module/B",
						functionC: "path/to/module/C",
					},
				},
				"Adjusted initial config for a specific target version"
			);
		});
	});

	describe("matchesVersion (sad path)", () => {
		it("Should retrieve false if target version is lower then the given version", () => {
			assert(
				!matchesVersion("1.3.0", "^1.3.1"),
				"Target version and given version don't match"
			);
		});

		it("Should retrieve false if target or version to match are invalid", () => {
			assert(
				!matchesVersion("invalid", "^1.1.1"),
				"Target version is invalid"
			);
			assert(
				!matchesVersion("1.1.1", "invalid"),
				"Matched version is invalid"
			);
		});
	});
	describe("adjustConfigForTargetVersion: (sad path)", () => {
		it("Should filter out modules and its group for given modules config", () => {
			const oInitialConfig = {
				modules: {
					"Module Root": {
						"Module A": {
							functionName: "functionA",
							version: "^1.58.0",
						},
						"Module B": {
							functionName: "functionB",
							version: "^1.40.0",
						},
						"Module C": {
							functionName: "functionC",
							version: "^1.44.0",
						},
					},
				},
				replacers: {
					functionA: "path/to/module/A",
					functionB: "path/to/module/B",
					functionC: "path/to/module/C",
				},
			};

			const oModifiedConfig = removeModulesNotMatchingTargetVersion(
				oInitialConfig,
				"1.34.0"
			);
			assert.deepEqual(
				oModifiedConfig,
				{
					modules: {},
					replacers: {
						functionA: "path/to/module/A",
						functionB: "path/to/module/B",
						functionC: "path/to/module/C",
					},
				},
				"Adjusted initial config for a specific target version"
			);
		});

		it("Should filter out modules and its group for given modules config with multiple groups", () => {
			const oInitialConfig = {
				modules: {
					"Module Root": {
						"Module A": {
							functionName: "functionA",
							version: "^1.58.0",
						},
						"Module B": {
							functionName: "functionB",
							version: "^1.40.0",
						},
						"Module C": {
							functionName: "functionC",
							version: "^1.44.0",
						},
					},
					"Module Sub": {
						"Module A": {
							functionName: "functionA",
							version: "^1.58.0",
						},
						"Module B": {
							functionName: "functionB",
							version: "^1.40.0",
						},
						"Module C": {
							functionName: "functionC",
							version: "^1.33.0",
						},
					},
					"Module Sub2": {},
				},
				replacers: {
					functionA: "path/to/module/A",
					functionB: "path/to/module/B",
					functionC: "path/to/module/C",
				},
			};

			const oModifiedConfig = removeModulesNotMatchingTargetVersion(
				oInitialConfig,
				"1.34.0"
			);
			assert.deepEqual(
				oModifiedConfig,
				{
					modules: {
						"Module Sub": {
							"Module C": {
								functionName: "functionC",
								version: "^1.33.0",
							},
						},
					},
					replacers: {
						functionA: "path/to/module/A",
						functionB: "path/to/module/B",
						functionC: "path/to/module/C",
					},
				},
				"Adjusted initial config for a specific target version"
			);
		});
	});
});
