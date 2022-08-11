import {
	CustomFileFinder,
	CustomFileInfo,
	CustomReporter,
} from "./util/testUtils";

const assert = require("assert");
const fs = require("graceful-fs");
const recast = require("recast");
const rootDir = "./test/replaceJQuery/";

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
		it("should replace jQuery.fn.control with UI5Element.closestTo", done => {
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
	});
});
