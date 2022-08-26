import {
	CustomFileFinder,
	CustomFileInfo,
	CustomReporter,
} from "./util/testUtils";

const assert = require("assert");
const fs = require("graceful-fs");
const recast = require("recast");
const rootDir = "./test/addMissingDependencies/";

import {analyse, migrate} from "../src/tasks/addMissingDependencies";

const fileFinder = new CustomFileFinder();

function analyseMigrateAndTest(
	module: CustomFileInfo,
	expectedModification: boolean,
	expectedContent: string,
	config: {},
	done?: Function,
	expectedReports: string[] = [],
	level = "debug"
) {
	const reporter = new CustomReporter([], level);
	const pAnalysisAndMigration = analyse({
		file: module,
		fileFinder,
		reporter,
		config,
	})
		.then(analyseResult => {
			if (migrate && analyseResult) {
				return migrate({
					file: module,
					fileFinder,
					reporter,
					analyseResult,
					config,
				});
			} else {
				return false;
			}
		})
		.then(didModify => {
			assert.strictEqual(
				didModify,
				expectedModification,
				"Modification has invalid value"
			);
			const actualContent = recast.print(module.getAST(), {
				lineTerminator: "\n",
				useTabs: true,
			}).code;
			assert.equal(actualContent, expectedContent);

			assert.deepStrictEqual(reporter.getReports(), expectedReports);
		});
	if (!done) {
		return pAnalysisAndMigration;
	}
	return pAnalysisAndMigration
		.then(() => {
			done();
		})
		.catch(e => {
			done(e);
		});
}

describe("addMissingDependencies", () => {
	describe("#start()", () => {
		it("should addMissingDependencies", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "test.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "test.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "test.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("should addMissingDependencies for FunctionFinder", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "test2.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "test2.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "test2.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("should addMissingDependencies only for jQuery calls", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "control.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "control.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "control.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("should addMissingDependencies for jQuery.Event", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "event.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "event.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "event.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("should addMissingDependencies for jQuery.Event.getPseudoTypes", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "pseudotypes.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "pseudotypes.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "pseudotypes.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("should addMissingDependencies for jQuery selectors", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "selector.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "selector.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "selector.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("should addMissingDependencies for multiple with mixed addImport and addUnusedImport", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "multiple.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "multiple.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "multiple.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("add import with comment", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "addCommentToImport.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(
					rootDir + "addCommentToImport.config.json",
					"utf8"
				)
			);
			const module = new CustomFileInfo(
				rootDir + "addCommentToImport.js"
			);
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("Renaming jQueryDOM", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "renaming.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "renaming.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "renaming.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("Renaming jQueryDOM 2 variables", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "renamingVars.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "renamingVars.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "renamingVars.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("Find jQuery SAP calls", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "findJQuerySapCalls.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(
					rootDir + "findJQuerySapCalls.config.json",
					"utf8"
				)
			);
			const module = new CustomFileInfo(
				rootDir + "findJQuerySapCalls.js"
			);
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("JQuery Plugin addAriaLabelledBy", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jquery-plugin-addAriaLabelledBy.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(
					rootDir + "jquery-plugin-addAriaLabelledBy.config.json",
					"utf8"
				)
			);
			const module = new CustomFileInfo(
				rootDir + "jquery-plugin-addAriaLabelledBy.js"
			);
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("Identify zIndex calls", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "zIndex.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "zIndex.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "zIndex.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("Non zIndex calls", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "zIndexNoReplacement.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(
					rootDir + "zIndexNoReplacement.config.json",
					"utf8"
				)
			);
			const module = new CustomFileInfo(
				rootDir + "zIndexNoReplacement.js"
			);
			analyseMigrateAndTest(
				module,
				false,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("Invalid config, no finder found", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "findJQuerySapCalls.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "invalidConfig.config.json", "utf8")
			);
			const module = new CustomFileInfo(
				rootDir + "findJQuerySapCalls.js"
			);
			analyseMigrateAndTest(
				module,
				false,
				expectedContent,
				config,
				null,
				[]
			)
				.then(() => {
					done(new Error("should not happen"));
				})
				.catch(oErr => {
					assert.equal(
						'Failed to find Finder for "JQueryFunctionExtensionFinder"',
						oErr.message
					);
					done();
				});
		});

		it("find jQuery.sap.extend", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "findJQuerySapExtendCalls.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(
					rootDir + "findJQuerySapExtendCalls.config.json",
					"utf8"
				)
			);
			const module = new CustomFileInfo(
				rootDir + "findJQuerySapExtendCalls.js"
			);
			analyseMigrateAndTest(
				module,
				false,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("find jQuery.sap functions", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "findJQuerySapFunctionCalls.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(
					rootDir + "findJQuerySapFunctionCalls.config.json",
					"utf8"
				)
			);
			const module = new CustomFileInfo(
				rootDir + "findJQuerySapFunctionCalls.js"
			);
			analyseMigrateAndTest(
				module,
				false,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("invalid define (should not get modified)", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "invalidDefine.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "invalidDefine.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "invalidDefine.js");
			analyseMigrateAndTest(
				module,
				false,
				expectedContent,
				config,
				done,
				[
					"warning: unsupported sap.ui.define without factory found for ./test/addMissingDependencies/invalidDefine",
				]
			);
		});

		it("uriParamsInterim", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "uriParamsInterim.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(
					rootDir + "uriParamsInterim.config.json",
					"utf8"
				)
			);
			const module = new CustomFileInfo(rootDir + "uriParamsInterim.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("variableReuse", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "variableReuse.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "variableReuse.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "variableReuse.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("should replace jQuery.fn.control with UI5Element.closestTo", done => {
			const subDir = rootDir + "replaceJQuery/";
			const expectedContent = fs.readFileSync(
				subDir + "control.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(subDir + "control.config.json", "utf8")
			);
			const module = new CustomFileInfo(subDir + "control.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});

		it("should replace sap.ui.getCore().getConfiguration() with Configuration module", done => {
			const subDir = rootDir + "coreConfiguration/";
			const expectedContent = fs.readFileSync(
				subDir + "configuration.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(subDir + "configuration.config.json", "utf8")
			);
			const module = new CustomFileInfo(subDir + "configuration.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[]
			);
		});
	});
});
