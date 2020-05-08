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
	let oStub;
	beforeEach(function() {
		oStub = sinon.stub(FileUtils, "fsWriteFile").resolves();
	});

	afterEach(function() {
		if (oStub) {
			oStub.restore();
		}
	});
	it("project", function(done) {
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

	it("project2", function(done) {
		const expectedContent = fs.readFileSync(
			rootDir + "project2/manifest.expected.json",
			"utf8"
		);
		const module = new CustomFileInfo(rootDir + "project2/Component.js");
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

	it("project3", function(done) {
		const expectedContent = fs.readFileSync(
			rootDir + "project3/comp/manifest.expected.json",
			"utf8"
		);
		const module = new CustomFileInfo(
			rootDir + "project3/comp/Component.js"
		);
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

	it("project4", function(done) {
		const expectedContent = fs.readFileSync(
			rootDir + "project4/manifest.expected.json",
			"utf8"
		);
		const module = new CustomFileInfo(rootDir + "project4/Component.js");
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

	it("project5", function(done) {
		const expectedContent = fs.readFileSync(
			rootDir + "project5/manifest.expected.json",
			"utf8"
		);
		const module = new CustomFileInfo(rootDir + "project5/Component.js");
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

	it("project6", function(done) {
		const expectedContent = fs.readFileSync(
			rootDir + "project6/app/manifest.expected.json",
			"utf8"
		);
		const module = new CustomFileInfo(
			rootDir + "project6/app/Component.js"
		);
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
