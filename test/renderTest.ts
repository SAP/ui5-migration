import {analyse, migrate} from "../src/tasks/addRenderers";

import {
	CustomFileFinder,
	CustomFileInfo,
	CustomReporter,
} from "./util/testUtils";

const fs = require("graceful-fs");
const recast = require("recast");
const assert = require("assert");
const rootDir = "./test/";

const fileFinder = new CustomFileFinder();
const reporter = new CustomReporter([], "debug");

describe("addRenderer tests", function() {
	it("should add metadata renderers", function(done) {
		const module = new CustomFileInfo(
			rootDir + "addRenderers/myTestControlMetaRenderer.js"
		);

		analyse({file: module, fileFinder, reporter})
			.then(function(analyseResult) {
				if (analyseResult) {
					done("No renderer should be added");
				} else {
					done();
				}
			})
			.catch(function(e) {
				done(e);
			});
	});

	it("should add proto renderers", function(done) {
		const module = new CustomFileInfo(
			rootDir + "addRenderers/myTestControlProtoRenderer.js"
		);

		analyse({file: module, fileFinder, reporter})
			.then(function(analyseResult) {
				if (analyseResult) {
					done("No renderer should be added");
				} else {
					done();
				}
			})
			.catch(function(e) {
				done(e);
			});
	});

	it("should add no renderers as already defined", function(done) {
		const module = new CustomFileInfo(
			rootDir + "addRenderers/myControl.js"
		);

		analyse({file: module, fileFinder, reporter})
			.then(function(analyseResult) {
				if (analyseResult) {
					done("No renderer should be added");
				} else {
					done();
				}
			})
			.catch(function(e) {
				done(e);
			});
	});

	it("should add no renderers", function(done) {
		const module = new CustomFileInfo(
			rootDir + "addRenderers/myTestControlNoRenderer.js"
		);
		const expectedContent = fs.readFileSync(
			rootDir + "addRenderers/myTestControlNoRenderer.expected.js",
			"utf8"
		);

		analyse({
			file: module,
			fileFinder,
			reporter,
			config: {addRendererField: true},
		})
			.then(function(analyseResult) {
				if (!analyseResult || !migrate) {
					throw new Error("A renderer should be added");
				}
				return migrate({
					file: module,
					fileFinder,
					reporter,
					analyseResult,
					config: {addRendererField: true},
				});
			})
			.then(function(didModify) {
				assert.ok(didModify, "Migration should add the renderer");
				const actualContent = recast.print(module.getAST(), {
					lineTerminator: "\n",
					useTabs: true,
				}).code;
				assert.equal(actualContent, expectedContent);
			})
			.then(function() {
				done();
			})
			.catch(function(e) {
				done(e);
			});
	});

	it("should ignore invalid define", function(done) {
		const module = new CustomFileInfo(
			rootDir + "addRenderers/invalidDefine.js"
		);

		analyse({file: module, fileFinder, reporter})
			.then(function(analyseResult) {
				if (analyseResult) {
					done("No renderer should be added");
				} else {
					done();
				}
			})
			.catch(function(e) {
				done(e);
			});
	});
});
