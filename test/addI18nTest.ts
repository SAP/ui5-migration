import {
	CustomFileFinder,
	CustomFileInfo,
	CustomReporter,
} from "./util/testUtils";

const assert = require("assert");
const fs = require("graceful-fs");
const recast = require("recast");
const rootDir = "./test/addI18n/";
const sinon = require("sinon");

import * as FileUtils from "../src/util/FileUtils";

import {analyse, migrate} from "../src/tasks/addI18n";
import {FileInfo} from "ui5-migration";

const fileFinder = new CustomFileFinder();

interface Content {
	/**
	 *
	 * @param {string} path file path, e.g. test/MyFile.js
	 */
	getContent(): string;
}

function analyseMigrateAndTest(
	module: CustomFileInfo,
	expectedModification: boolean,
	expectedContent: string,
	config: {},
	content: Content,
	done?: Function,
	expectedReports: string[] = []
) {
	const reporter = new CustomReporter([], "debug");
	const pAnalysisAndMigration = analyse({
		file: module,
		fileFinder,
		reporter,
		config,
	})
		.then(function(analyseResult) {
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
		.then(function(didModify) {
			assert.strictEqual(
				didModify,
				expectedModification,
				"Modification has invalid value"
			);
			const actualContent = content.getContent();
			assert.equal(actualContent, expectedContent);

			assert.deepStrictEqual(reporter.getReports(), expectedReports);
		});
	if (!done) {
		return pAnalysisAndMigration;
	}
	return pAnalysisAndMigration
		.then(function() {
			done();
		})
		.catch(function(e) {
			done(e);
		});
}

describe("addI18n", function() {
	describe("#start()", function() {
		let oStub;
		beforeEach(function() {
			oStub = sinon.stub(FileUtils, "fsWriteFile").resolves();
		});

		afterEach(function() {
			if (oStub) {
				oStub.restore();
			}
		});
		it("should addMissingDependencies", function(done) {
			const expectedContent = fs.readFileSync(
				rootDir + "project/manifest.expected.json",
				"utf8"
			);
			const module = new CustomFileInfo(rootDir + "project/Component.js");
			analyseMigrateAndTest(
				module,
				false,
				expectedContent,
				{},
				{
					getContent(): string {
						return oStub.getCalls()[0].args[1];
					},
				},
				done,
				[]
			);
		});
	});
});
