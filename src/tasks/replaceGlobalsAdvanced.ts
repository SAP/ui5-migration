"use strict";

import * as Mod from "../Migration";
import * as fs from "graceful-fs";
import * as path from "path";



const addMissingDependencies = require("./addMissingDependencies");


/*
 * Replace globals but with advanced replacements / import modifications such
 * as jQuery.sap.extend and jQuery.extend
 * Should run after the standard replaceGlobals.
 */
const replaceGlobalsAdvanced: Mod.Task = {
	description : "Replaces advanced globals",
	keywords : [ "all", "replace-globals-advanced" ],
	priority : 2,
	defaultConfig() {
		return Promise.resolve(JSON.parse(fs.readFileSync(
			path.join(
				__dirname,
				"../../../defaultConfig/replaceGlobalsAdvanced.config.json"),
			"utf8")));
	},
	analyse : addMissingDependencies.analyse,
	migrate : addMissingDependencies.migrate
};
export = replaceGlobalsAdvanced;