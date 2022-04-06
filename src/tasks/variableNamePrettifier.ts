"use strict";

import * as Mod from "../Migration";
import * as path from "path";

const addMissingDependencies = require("./addMissingDependencies");

/*
 * Exports Variable name prettifier
 * Should run at the end.
 */
const variableNamePrettifier: Mod.Task = {
	description: "Prettifies variable names",
	keywords: ["all", "variable-name-prettifier"],
	priority: 2,
	defaultConfig() {
		return Promise.resolve(
			require(path.join(
				__dirname,
				"../../defaultConfig/variableNamePrettifier.config.json"
			))
		);
	},
	analyse: addMissingDependencies.analyse,
	migrate: addMissingDependencies.migrate,
};
export = variableNamePrettifier;
