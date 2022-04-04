import {analyse, migrate} from "../src/tasks/replaceGlobals";

import {
	CustomFileFinder,
	CustomFileInfo,
	CustomReporter,
} from "./util/testUtils";

const fs = require("graceful-fs");
const recast = require("recast");
const assert = require("assert");
const rootDir = "./test/replaceGlobals/";

const fileFinder = new CustomFileFinder();

function analyseMigrateAndTest(
	module: CustomFileInfo,
	expectedModification: boolean,
	expectedContent: string,
	config: {},
	done: Function,
	expectedReports: string[] = [],
	level = "trace",
	targetVersion = "latest",
	findings = undefined
) {
	const reporter = new CustomReporter([], level);
	reporter.setContext({
		fileName: module.getPath(),
		taskName: "replaceGlobals",
	});
	analyse({file: module, fileFinder, reporter, config, targetVersion})
		.then(analyseResult => {
			if (findings) {
				assert.deepStrictEqual(
					reporter.getFindings(),
					findings,
					"Findings must match"
				);
			}
			if (analyseResult && migrate) {
				return migrate({
					file: module,
					fileFinder,
					reporter,
					analyseResult,
					config,
					targetVersion,
				});
			} else {
				return false;
			}
		})
		.then(didModify => {
			assert.strictEqual(
				didModify,
				expectedModification,
				"file modification not as expected"
			);
			const actualContent = recast.print(module.getAST(), {
				lineTerminator: "\n",
				useTabs: true,
			}).code;
			assert.equal(actualContent, expectedContent);

			assert.deepStrictEqual(reporter.getReports(), expectedReports);
		})
		.then(() => {
			done();
		})
		.catch(e => {
			done(e);
		});
}

describe("replaceGlobals", () => {
	describe("#start()", () => {
		it("should replaceGlobals encodeXML", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "encodeXML.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "encodeXML.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "encodeXML.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 23: Replace global call with "sap.base.security.encodeXML"',
				'trace: 23: Found call to replace "jQuery.sap.encodeHTML"',
				'trace: 29: Replace global call with "sap.base.security.encodeXML"',
				'trace: 29: Found call to replace "jQuery.sap.encodeHTML"',
				'trace: 32: Replace global call with "sap.base.security.encodeXML"',
				'trace: 32: Found call to replace "jQuery.sap.encodeXML"',
				'trace: 35: Replace global call with "sap.base.security.encodeXML"',
				'trace: 35: Found call to replace "jQuery.sap.encodeXML"',
				'trace: 35: Replace global call with "sap.base.security.encodeXML"',
				'trace: 35: Found call to replace "jQuery.sap.encodeHTML"',
				'trace: 35: Replace global call with "sap.base.security.encodeXML"',
				'trace: 35: Found call to replace "jQuery.sap.encodeXML"',
				'trace: 39: Replace global call with "sap.base.security.encodeXML"',
				'trace: 39: Found call to replace "jQuery.sap.encodeHTML"',
				'trace: 40: Replace global call with "sap.base.security.encodeXML"',
				'trace: 40: Found call to replace "jQuery.sap.encodeHTML"',
				'trace: 23: Replaced call "jQuery.sap.encodeHTML"',
				'trace: 29: Replaced call "jQuery.sap.encodeHTML"',
				'trace: 32: Replaced call "jQuery.sap.encodeXML"',
				'trace: 35: Replaced call "jQuery.sap.encodeXML"',
				'trace: 35: Replaced call "jQuery.sap.encodeHTML"',
				'trace: 35: Replaced call "jQuery.sap.encodeXML"',
				'trace: 39: Replaced call "jQuery.sap.encodeHTML"',
				'trace: 40: Replaced call "jQuery.sap.encodeHTML"',
				'trace: 7: Add dependency "sap/base/security/encodeXML" named "encodeXML"',
				'trace: 7: Remove dependency "jquery.sap.encoder"',
			]);
		});

		it("should replaceGlobals but with jQuery usage", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jQ.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "jQ.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "jQ.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 11: Replace global call with "thirdparty.jQuery"',
				'trace: 11: Found call to replace "jQuery"',
				'trace: 26: Replace global call with "thirdparty.jQuery"',
				'trace: 26: Found call to replace "jQuery.extend"',
				'trace: 30: Replace global call with "sap.base.assert"',
				'trace: 30: Found call to replace "jQuery.sap.assert"',
				'trace: 33: Replace global call with "sap.base.assert"',
				'trace: 33: Found call to replace "jQuery.sap.assert"',
				'trace: 36: Replace global call with "sap.base.assert"',
				'trace: 36: Found call to replace "jQuery.sap.assert"',
				'trace: 36: Replace global call with "sap.base.assert"',
				'trace: 36: Found call to replace "jQuery.sap.assert"',
				'trace: 36: Replace global call with "sap.base.assert"',
				'trace: 36: Found call to replace "jQuery.sap.assert"',
				'trace: 38: Replace global call with "thirdparty.jQuery"',
				'trace: 38: Found call to replace "jQuery"',
				'trace: 40: Replace global call with "sap.base.assert"',
				'trace: 40: Found call to replace "jQuery.sap.assert"',
				'trace: 40: Replace global call with "thirdparty.jQuery"',
				'trace: 40: Found call to replace "jQuery"',
				'trace: 42: Replace global call with "thirdparty.jQuery"',
				'trace: 42: Found call to replace "jQuery"',
				'trace: 44: Replace global call with "thirdparty.jQuery"',
				'trace: 44: Found call to replace "jQuery"',
				'trace: 46: Replace global call with "thirdparty.jQuery"',
				'trace: 46: Found call to replace "jQuery"',
				'trace: 11: Replaced call "jQuery"',
				'trace: 26: Replaced call "jQuery.extend"',
				'trace: 30: Replaced call "jQuery.sap.assert"',
				'trace: 33: Replaced call "jQuery.sap.assert"',
				'trace: 36: Replaced call "jQuery.sap.assert"',
				'trace: 36: Replaced call "jQuery.sap.assert"',
				'trace: 36: Replaced call "jQuery.sap.assert"',
				'trace: 38: Replaced call "jQuery"',
				'trace: 40: Replaced call "jQuery.sap.assert"',
				'trace: 40: Replaced call "jQuery"',
				'trace: 42: Replaced call "jQuery"',
				'trace: 44: Replaced call "jQuery"',
				'trace: 46: Replaced call "jQuery"',
				'trace: 7: Modify dependency "thirdparty/jQuery" named "jQuery"',
				'trace: 7: Add dependency "sap/base/assert" named "assert"',
			]);
		});

		it("should replaceGlobals and use unique names duplicateVars", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "duplicateVars.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "duplicateVars.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "duplicateVars.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 30: Replace global call with "sap.base.security.encodeXML"',
				'trace: 30: Found call to replace "jQuery.sap.encodeHTML"',
				'trace: 34: Replace global call with "sap.base.security.encodeXML"',
				'trace: 34: Found call to replace "jQuery.sap.encodeHTML"',
				'trace: 37: Replace global call with "sap.base.security.encodeXML"',
				'trace: 37: Found call to replace "jQuery.sap.encodeXML"',
				'trace: 40: Replace global call with "sap.base.security.encodeXML"',
				'trace: 40: Found call to replace "jQuery.sap.encodeXML"',
				'trace: 40: Replace global call with "sap.base.security.encodeXML"',
				'trace: 40: Found call to replace "jQuery.sap.encodeHTML"',
				'trace: 40: Replace global call with "sap.base.security.encodeXML"',
				'trace: 40: Found call to replace "jQuery.sap.encodeXML"',
				'trace: 69: Replace global call with "sap.base.security.encodeXML"',
				'trace: 69: Found call to replace "jQuery.sap.encodeXML"',
				'trace: 30: Replaced call "jQuery.sap.encodeHTML"',
				'trace: 34: Replaced call "jQuery.sap.encodeHTML"',
				'trace: 37: Replaced call "jQuery.sap.encodeXML"',
				'trace: 40: Replaced call "jQuery.sap.encodeXML"',
				'trace: 40: Replaced call "jQuery.sap.encodeHTML"',
				'trace: 40: Replaced call "jQuery.sap.encodeXML"',
				'trace: 69: Replaced call "jQuery.sap.encodeXML"',
				'trace: 7: Add dependency "sap/base/security/encodeXML" named "encodeXML4"',
				'trace: 7: Remove dependency "jquery.sap.encoder"',
			]);
		});

		it("should replaceGlobals and use existing imports reuseVars", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "reuseVar.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "reuseVar.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "reuseVar.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[
					'trace: 10: Replace global call with "sap.base.security.encodeXML"',
					'trace: 10: Found call to replace "jQuery.sap.encodeXML"',
					'trace: 10: Replaced call "jQuery.sap.encodeXML"',
					'trace: 7: Remove dependency "jquery.sap.encoder"',
				],
				"trace",
				"latest",
				[
					{
						fileName: "./test/replaceGlobals/reuseVar.js",
						location: {
							endColumn: 28,
							endLine: 10,
							startColumn: 8,
							startLine: 10,
						},
						message: "found deprecated global",
						taskName: "replaceGlobals",
					},
				]
			);
		});

		it("should replaceGlobals unusedGlobals", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "unusedGlobals.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "unusedGlobals.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "unusedGlobals.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[
					'trace: 7: Remove dependency "jquery.sap.mod1"',
					'trace: 7: Remove dependency "jquery.sap.mod3"',
				],
				"trace",
				"latest",
				[]
			);
		});

		it("should replaceGlobals asterisk", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "asterisk.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "asterisk.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "asterisk.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[
					'trace: 22: Replace global call with "sap.base.i18n.ResourceBundle"',
					'trace: 22: Found call to replace "jQuery.sap.resources.isBundle"',
					'trace: 22: Replaced call "jQuery.sap.resources"',
					'trace: 7: Add dependency "sap/base/i18n/ResourceBundle" named "ResourceBundle"',
				],
				"trace",
				"latest",
				[
					{
						fileName: "./test/replaceGlobals/asterisk.js",
						location: {
							endColumn: 45,
							endLine: 22,
							startColumn: 16,
							startLine: 22,
						},
						message: "found deprecated global",
						taskName: "replaceGlobals",
					},
				]
			);
		});

		it("should replaceGlobals startsWith", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "endsWith.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "endsWith.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "endsWith.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 23: Replace global call with "endsWith"',
				'trace: 23: Found call to replace "jQuery.sap.endsWith"',
				'trace: 27: Replace global call with "endsWith"',
				'trace: 27: Found call to replace "jQuery.sap.endsWith"',
				'trace: 30: Replace global call with "startsWith"',
				'trace: 30: Found call to replace "jQuery.sap.startsWith"',
				'trace: 33: Replace global call with "startsWith"',
				'trace: 33: Found call to replace "jQuery.sap.startsWith"',
				'trace: 32: Replace global call with "startsWith"',
				'trace: 32: Found call to replace "jQuery.sap.startsWith"',
				'trace: 32: Replace global call with "startsWith"',
				'trace: 32: Found call to replace "jQuery.sap.startsWith"',
				'trace: 36: Replace global call with "startsWith"',
				'trace: 36: Found call to replace "jQuery.sap.startsWith"',
				'trace: 38: Replace global call with "startsWith"',
				'trace: 38: Found call to replace "jQuery.sap.startsWith"',
				'trace: 41: Replace global call with "endsWith"',
				'trace: 41: Found call to replace "jQuery.sap.endsWith"',
				'trace: 42: Replace global call with "endsWith"',
				'trace: 42: Found call to replace "jQuery.sap.endsWith"',
				'trace: 43: Replace global call with "endsWith"',
				'trace: 43: Found call to replace "jQuery.sap.endsWith"',
				'trace: 45: Replace global call with "startsWith"',
				'trace: 45: Found call to replace "jQuery.sap.startsWith"',
				'trace: 47: Replace global call with "endsWith"',
				'trace: 47: Found call to replace "jQuery.sap.endsWith"',
				'trace: 23: Replaced call "jQuery.sap.endsWith"',
				'trace: 27: Replaced call "jQuery.sap.endsWith"',
				'trace: 30: Replaced call "jQuery.sap.startsWith"',
				'trace: 33: Replaced call "jQuery.sap.startsWith"',
				'trace: 32: Replaced call "jQuery.sap.startsWith"',
				'trace: 32: Replaced call "jQuery.sap.startsWith"',
				'trace: 36: Replaced call "jQuery.sap.startsWith"',
				'trace: 38: Replaced call "jQuery.sap.startsWith"',
				'trace: 41: Replaced call "jQuery.sap.endsWith"',
				'trace: 42: Replaced call "jQuery.sap.endsWith"',
				'trace: 43: Replaced call "jQuery.sap.endsWith"',
				"debug: 45: ignored element: jQuery.sap.startsWith",
				"error: 45: Error: insertion is of type CallExpression(supported are only Call-Expressions)",
				"debug: 47: ignored element: jQuery.sap.endsWith",
				"error: 47: Error: insertion is of type CallExpression(supported are only Call-Expressions)",
			]);
		});

		it("should replaceGlobals isEqualNode", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "isEqualNode.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "isEqualNode.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "isEqualNode.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 23: Replace global call with "isEqualNode"',
				'trace: 23: Found call to replace "jQuery.sap.isEqualNode"',
				'trace: 27: Replace global call with "isEqualNode"',
				'trace: 27: Found call to replace "jQuery.sap.isEqualNode"',
				'trace: 30: Replace global call with "isEqualNode"',
				'trace: 30: Found call to replace "jQuery.sap.isEqualNode"',
				'trace: 33: Replace global call with "isEqualNode"',
				'trace: 33: Found call to replace "jQuery.sap.isEqualNode"',
				'trace: 32: Replace global call with "isEqualNode"',
				'trace: 32: Found call to replace "jQuery.sap.isEqualNode"',
				'trace: 32: Replace global call with "isEqualNode"',
				'trace: 32: Found call to replace "jQuery.sap.isEqualNode"',
				'trace: 36: Replace global call with "isEqualNode"',
				'trace: 36: Found call to replace "jQuery.sap.isEqualNode"',
				'trace: 38: Replace global call with "isEqualNode"',
				'trace: 38: Found call to replace "jQuery.sap.isEqualNode"',
				'trace: 40: Replace global call with "isEqualNode"',
				'trace: 40: Found call to replace "jQuery.sap.isEqualNode"',
				'trace: 42: Replace global call with "isEqualNode"',
				'trace: 42: Found call to replace "jQuery.sap.isEqualNode"',
				'trace: 23: Replaced call "jQuery.sap.isEqualNode"',
				'trace: 27: Replaced call "jQuery.sap.isEqualNode"',
				'trace: 30: Replaced call "jQuery.sap.isEqualNode"',
				'trace: 33: Replaced call "jQuery.sap.isEqualNode"',
				'trace: 32: Replaced call "jQuery.sap.isEqualNode"',
				'trace: 32: Replaced call "jQuery.sap.isEqualNode"',
				'trace: 36: Replaced call "jQuery.sap.isEqualNode"',
				'trace: 38: Replaced call "jQuery.sap.isEqualNode"',
				'trace: 40: Replaced call "jQuery.sap.isEqualNode"',
				'trace: 42: Replaced call "jQuery.sap.isEqualNode"',
				'trace: 7: Remove dependency "jquery.sap.xml"',
			]);
		});

		it("should replaceGlobals uriParams", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "uriParams.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "uriParams.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "uriParams.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 23: Replace global call with "sap.base.util.UriParameters"',
				'trace: 23: Found call to replace "jQuery.sap.getUriParameters"',
				'trace: 27: Replace global call with "sap.base.util.UriParameters"',
				'trace: 27: Found call to replace "jQuery.sap.getUriParameters"',
				'trace: 29: Replace global call with "sap.base.util.UriParameters"',
				'trace: 29: Found call to replace "jQuery.sap.getUriParameters"',
				'trace: 30: Replace global call with "sap.base.util.UriParameters"',
				'trace: 30: Found call to replace "jQuery.sap.getUriParameters"',
				'trace: 32: Replace global call with "sap.base.util.UriParameters"',
				'trace: 32: Found call to replace "jQuery.sap.getUriParameters"',
				'trace: 33: Replace global call with "sap.base.util.UriParameters"',
				'trace: 33: Found call to replace "jQuery.sap.getUriParameters"',
				'trace: 36: Replace global call with "sap.base.util.UriParameters"',
				'trace: 36: Found call to replace "jQuery.sap.getUriParameters"',
				'trace: 37: Replace global call with "sap.base.util.UriParameters"',
				'trace: 37: Found call to replace "jQuery.sap.getUriParameters"',
				'trace: 38: Replace global call with "sap.base.util.UriParameters"',
				'trace: 38: Found call to replace "jQuery.sap.getUriParameters"',
				'trace: 23: Replaced call "jQuery.sap.getUriParameters"',
				'trace: 27: Replaced call "jQuery.sap.getUriParameters"',
				'trace: 29: Replaced call "jQuery.sap.getUriParameters"',
				'trace: 30: Replaced call "jQuery.sap.getUriParameters"',
				'trace: 32: Replaced call "jQuery.sap.getUriParameters"',
				'trace: 33: Replaced call "jQuery.sap.getUriParameters"',
				'trace: 36: Replaced call "jQuery.sap.getUriParameters"',
				'trace: 37: Replaced call "jQuery.sap.getUriParameters"',
				'trace: 38: Replaced call "jQuery.sap.getUriParameters"',
				'trace: 7: Add dependency "sap/base/util/UriParameters" named "UriParameters"',
				'trace: 7: Remove dependency "jquery.sap.script"',
			]);
		});

		it("should replaceGlobals padding", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "padding.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "padding.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "padding.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 23: Replace global call with "padStart"',
				'trace: 23: Found call to replace "jQuery.sap.padLeft"',
				'trace: 27: Replace global call with "padStart"',
				'trace: 27: Found call to replace "jQuery.sap.padLeft"',
				'trace: 29: Replace global call with "padStart"',
				'trace: 29: Found call to replace "jQuery.sap.padLeft"',
				'trace: 30: Replace global call with "padStart"',
				'trace: 30: Found call to replace "jQuery.sap.padLeft"',
				'trace: 23: Replaced call "jQuery.sap.padLeft"',
				'trace: 27: Replaced call "jQuery.sap.padLeft"',
				'trace: 29: Replaced call "jQuery.sap.padLeft"',
				'trace: 30: Replaced call "jQuery.sap.padLeft"',
				'trace: 7: Remove dependency "jquery.sap.strings"',
			]);
		});

		it("should replaceGlobals delay", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "delay.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "delay.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "delay.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				"trace: 26: Deprecated call of type DelayedCall",
				'trace: 26: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 27: Deprecated call of type DelayedCall",
				'trace: 27: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 28: Deprecated call of type DelayedCall",
				'trace: 28: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 29: Deprecated call of type DelayedCall",
				'trace: 29: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 30: Deprecated call of type DelayedCall",
				'trace: 30: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 33: Deprecated call of type DelayedCall",
				'trace: 33: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 34: Deprecated call of type DelayedCall",
				'trace: 34: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 36: Deprecated call of type DelayedCall",
				'trace: 36: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 40: Deprecated call of type DelayedCall",
				'trace: 40: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 44: Deprecated call of type DelayedCall",
				'trace: 44: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 48: Deprecated call of type DelayedCall",
				'trace: 48: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 53: Deprecated call of type DelayedCall",
				'trace: 53: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 59: Deprecated call of type DelayedCall",
				'trace: 59: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 63: Deprecated call of type DelayedCall",
				'trace: 63: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 68: Deprecated call of type DelayedCall",
				'trace: 68: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 71: Deprecated call of type DelayedCall",
				'trace: 71: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 75: Deprecated call of type DelayedCall",
				'trace: 75: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 76: Deprecated call of type DelayedCall",
				'trace: 76: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 77: Deprecated call of type DelayedCall",
				'trace: 77: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 80: Deprecated call of type DelayedCall",
				'trace: 80: Found call to replace "jQuery.sap.delayedCall"',
				"trace: 81: Deprecated call of type DelayedCall",
				'trace: 81: Found call to replace "jQuery.sap.delayedCall"',
				'trace: 26: Replaced call "jQuery.sap.delayedCall"',
				'trace: 27: Replaced call "jQuery.sap.delayedCall"',
				'trace: 28: Replaced call "jQuery.sap.delayedCall"',
				'trace: 29: Replaced call "jQuery.sap.delayedCall"',
				'trace: 30: Replaced call "jQuery.sap.delayedCall"',
				'trace: 33: Replaced call "jQuery.sap.delayedCall"',
				'trace: 34: Replaced call "jQuery.sap.delayedCall"',
				'trace: 36: Replaced call "jQuery.sap.delayedCall"',
				'trace: 40: Replaced call "jQuery.sap.delayedCall"',
				'trace: 44: Replaced call "jQuery.sap.delayedCall"',
				'trace: 48: Replaced call "jQuery.sap.delayedCall"',
				'trace: 53: Replaced call "jQuery.sap.delayedCall"',
				'trace: 59: Replaced call "jQuery.sap.delayedCall"',
				'trace: 63: Replaced call "jQuery.sap.delayedCall"',
				'trace: 68: Replaced call "jQuery.sap.delayedCall"',
				'trace: 71: Replaced call "jQuery.sap.delayedCall"',
				'trace: 75: Replaced call "jQuery.sap.delayedCall"',
				'trace: 76: Replaced call "jQuery.sap.delayedCall"',
				'trace: 77: Replaced call "jQuery.sap.delayedCall"',
				'trace: 80: Replaced call "jQuery.sap.delayedCall"',
				'trace: 81: Replaced call "jQuery.sap.delayedCall"',
				'trace: 7: Remove dependency "jquery.sap.script"',
			]);
		});

		it("should replaceGlobals isMouseEventDelayed", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "isMouseEventDelayed.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(
					rootDir + "isMouseEventDelayed.config.json",
					"utf8"
				)
			);
			const module = new CustomFileInfo(
				rootDir + "isMouseEventDelayed.js"
			);
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 24: Replace global call with "sap.ui.events.isMouseEventDelayed"',
				'trace: 24: Found call to replace "jQuery.sap.isMouseEventDelayed"',
				'trace: 25: Replace global call with "sap.ui.events.isMouseEventDelayed"',
				'trace: 25: Found call to replace "jQuery.sap.isMouseEventDelayed"',
				'trace: 23: Replace global call with "sap.ui.events.isMouseEventDelayed"',
				'trace: 23: Found call to replace "jQuery.sap.isMouseEventDelayed"',
				'trace: 29: Replace global call with "sap.ui.events.isMouseEventDelayed"',
				'trace: 29: Found call to replace "jQuery.sap.isMouseEventDelayed"',
				'trace: 27: Replace global call with "sap.ui.events.isMouseEventDelayed"',
				'trace: 27: Found call to replace "jQuery.sap.isMouseEventDelayed"',
				'trace: 24: Replaced call "jQuery.sap.isMouseEventDelayed"',
				'trace: 25: Replaced call "jQuery.sap.isMouseEventDelayed"',
				'trace: 23: Replaced call "jQuery.sap.isMouseEventDelayed"',
				"debug: 29: ignored element: jQuery.sap.isMouseEventDelayed",
				"error: 29: Error: insertion is of type AssignmentExpression is not supported",
				'trace: 27: Replaced call "jQuery.sap.isMouseEventDelayed"',
				'trace: 7: Add dependency "sap/ui/events/isMouseEventDelayed" named "isMouseEventDelayed"',
			]);
		});

		it("should replaceGlobals domById", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "domById.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "domById.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "domById.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				"trace: 24: Deprecated call of type domById",
				'trace: 24: Found call to replace "jQuery.sap.domById"',
				"trace: 26: Deprecated call of type domById",
				'trace: 26: Found call to replace "jQuery.sap.domById"',
				"trace: 28: Deprecated call of type domById",
				'trace: 28: Found call to replace "jQuery.sap.domById"',
				"trace: 32: Deprecated call of type domById",
				'trace: 32: Found call to replace "jQuery.sap.domById"',
				"trace: 35: Deprecated call of type domById",
				'trace: 35: Found call to replace "jQuery.sap.domById"',
				"trace: 37: Deprecated call of type domById",
				'trace: 37: Found call to replace "jQuery.sap.domById"',
				'trace: 24: Replaced call "jQuery.sap.domById"',
				'trace: 26: Replaced call "jQuery.sap.domById"',
				'trace: 28: Replaced call "jQuery.sap.domById"',
				'trace: 32: Replaced call "jQuery.sap.domById"',
				'trace: 35: Replaced call "jQuery.sap.domById"',
				'trace: 37: Replaced call "jQuery.sap.domById"',
				'trace: 7: Remove dependency "jquery.sap.dom"',
			]);
		});

		it("should replaceGlobals removeUrlW-list", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "removeUrlWhitelist.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(
					rootDir + "removeUrlWhitelist.config.json",
					"utf8"
				)
			);
			const module = new CustomFileInfo(
				rootDir + "removeUrlWhitelist.js"
			);
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 24: Replace global call with "sap.base.security.URLWhitelist"',
				'trace: 24: Found call to replace "jQuery.sap.removeUrlWhitelist"',
				'trace: 26: Replace global call with "sap.base.security.URLWhitelist"',
				'trace: 26: Found call to replace "jQuery.sap.removeUrlWhitelist"',
				'trace: 28: Replace global call with "sap.base.security.URLWhitelist"',
				'trace: 28: Found call to replace "jQuery.sap.removeUrlWhitelist"',
				'trace: 24: Replaced call "jQuery.sap.removeUrlWhitelist"',
				'trace: 26: Replaced call "jQuery.sap.removeUrlWhitelist"',
				'trace: 28: Replaced call "jQuery.sap.removeUrlWhitelist"',
				'trace: 7: Add dependency "sap/base/security/URLWhitelist" named "URLWhitelist"',
				'trace: 7: Remove dependency "jquery.sap.encoder"',
			]);
		});

		it("should replaceGlobals jqueryDomById", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jqueryDom.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "jqueryDom.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "jqueryDom.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 24: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 24: Found call to replace "jQuery.sap.byId"',
				'trace: 27: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 27: Found call to replace "jQuery.sap.byId"',
				'trace: 29: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 29: Found call to replace "jQuery.sap.byId"',
				'trace: 24: Replaced call "jQuery.sap.byId"',
				'trace: 27: Replaced call "jQuery.sap.byId"',
				'trace: 29: Replaced call "jQuery.sap.byId"',
				'trace: 7: Add dependency "sap/ui/thirdparty/jquery" named "jquery"',
				'trace: 7: Remove dependency "jquery.sap.dom"',
			]);
		});

		it("should replaceGlobals inArray", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "inArray.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "inArray.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "inArray.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				"trace: 24: Deprecated call of type inArray",
				'trace: 24: Found call to replace "jQuery.inArray"',
				"trace: 26: Deprecated call of type inArray",
				'trace: 26: Found call to replace "$.inArray"',
				"trace: 28: Deprecated call of type inArray",
				'trace: 28: Found call to replace "jQuery.inArray"',
				"trace: 33: Deprecated call of type inArray",
				'trace: 33: Found call to replace "jQuery.inArray"',
				"trace: 31: Deprecated call of type inArray",
				'trace: 31: Found call to replace "jQuery.inArray"',
				"trace: 30: Deprecated call of type inArray",
				'trace: 30: Found call to replace "jQuery.inArray"',
				'trace: 24: Replaced call "jQuery.inArray"',
				'trace: 26: Replaced call "$.inArray"',
				'trace: 28: Replaced call "jQuery.inArray"',
				'trace: 33: Replaced call "jQuery.inArray"',
				'trace: 31: Replaced call "jQuery.inArray"',
				'trace: 30: Replaced call "jQuery.inArray"',
			]);
		});

		it("should replaceGlobals inclusive version 1.58.0: jQuery.sap.*W-list -> URLW-list", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "inclusive158.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "inclusive.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "inclusive158.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[
					'trace: 26: Replace global call with "sap.base.security.URLWhitelist"',
					'trace: 26: Found call to replace "jQuery.sap.clearUrlWhitelist"',
					'trace: 28: Replace global call with "sap.base.security.URLWhitelist"',
					'trace: 28: Found call to replace "jQuery.sap.removeUrlWhitelist"',
					'trace: 30: Replace global call with "sap.base.security.URLWhitelist"',
					'trace: 30: Found call to replace "jQuery.sap.addUrlWhitelist"',
					'trace: 32: Replace global call with "sap.base.security.URLWhitelist"',
					'trace: 32: Found call to replace "jQuery.sap.getUrlWhitelist"',
					'trace: 33: Replace global call with "sap.base.security.URLWhitelist"',
					'trace: 33: Found call to replace "jQuery.sap.validateUrl"',
					'trace: 26: Replaced call "jQuery.sap.clearUrlWhitelist"',
					'trace: 28: Replaced call "jQuery.sap.removeUrlWhitelist"',
					'trace: 30: Replaced call "jQuery.sap.addUrlWhitelist"',
					'trace: 32: Replaced call "jQuery.sap.getUrlWhitelist"',
					'trace: 33: Replaced call "jQuery.sap.validateUrl"',
					'trace: 7: Add dependency "sap/base/security/URLWhitelist" named "URLWhitelist"',
					'trace: 7: Remove dependency "jquery.sap.encoder"',
				],
				"trace",
				"1.58.0"
			);
		});

		it("should replaceGlobals inclusive version to 1.85.0: jQuery.sap.*W-list -> URLListValidator", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "inclusive185.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "inclusive.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "inclusive185.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[
					'trace: 26: Replace global call with "sap.base.security.URLListValidator"',
					'trace: 26: Found call to replace "jQuery.sap.clearUrlWhitelist"',
					'trace: 28: Replace global call with "LEAVE"',
					'trace: 28: Found call to replace "jQuery.sap.removeUrlWhitelist"',
					'trace: 30: Replace global call with "sap.base.security.URLListValidator"',
					'trace: 30: Found call to replace "jQuery.sap.addUrlWhitelist"',
					'trace: 32: Replace global call with "sap.base.security.URLListValidator"',
					'trace: 32: Found call to replace "jQuery.sap.getUrlWhitelist"',
					'trace: 33: Replace global call with "sap.base.security.URLListValidator"',
					'trace: 33: Found call to replace "jQuery.sap.validateUrl"',
					'trace: 26: Replaced call "jQuery.sap.clearUrlWhitelist"',
					"debug: 28: ignored element: jQuery.sap.removeUrlWhitelist",
					"error: 28: Error: Ignore",
					'trace: 30: Replaced call "jQuery.sap.addUrlWhitelist"',
					'trace: 32: Replaced call "jQuery.sap.getUrlWhitelist"',
					'trace: 33: Replaced call "jQuery.sap.validateUrl"',
					'trace: 7: Add dependency "sap/base/security/URLListValidator" named "URLListValidator"',
				],
				"trace",
				"1.85.0"
			);
		});

		it("should replaceGlobals inclusive version to 1.90.0: URLW-list -> URLListValidator", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "inclusive190.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "inclusive.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "inclusive190.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[
					'trace: 26: Replace global call with "sap.base.security.URLListValidator"',
					'trace: 26: Found call to replace "URLWhitelist.clear"',
					'trace: 28: Replace global call with "sap.base.security.URLListValidator"',
					'trace: 28: Found call to replace "URLWhitelist.entries"',
					'trace: 28: Replace global call with "LEAVE"',
					'trace: 28: Found call to replace "URLWhitelist.delete"',
					'trace: 30: Replace global call with "sap.base.security.URLListValidator"',
					'trace: 30: Found call to replace "URLWhitelist.add"',
					'trace: 32: Replace global call with "sap.base.security.URLListValidator"',
					'trace: 32: Found call to replace "URLWhitelist.entries"',
					'trace: 33: Replace global call with "sap.base.security.URLListValidator"',
					'trace: 33: Found call to replace "URLWhitelist.validate"',
					'trace: 26: Replaced call "URLWhitelist.clear"',
					'trace: 28: Replaced call "URLWhitelist.entries"',
					"debug: 28: ignored element: URLWhitelist.delete",
					"error: 28: Error: Ignore",
					'trace: 30: Replaced call "URLWhitelist.add"',
					'trace: 32: Replaced call "URLWhitelist.entries"',
					'trace: 33: Replaced call "URLWhitelist.validate"',
					'trace: 7: Add dependency "sap/base/security/URLListValidator" named "URLListValidator"',
				],
				"trace",
				"1.90.0"
			);
		});

		it("should replaceGlobals intervalCall", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "interval.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "intervalCall.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "interval.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				"trace: 26: Deprecated call of type IntervalCall",
				'trace: 26: Found call to replace "jQuery.sap.intervalCall"',
				"trace: 30: Deprecated call of type IntervalCall",
				'trace: 30: Found call to replace "jQuery.sap.intervalCall"',
				"trace: 34: Deprecated call of type IntervalCall",
				'trace: 34: Found call to replace "jQuery.sap.intervalCall"',
				"trace: 38: Deprecated call of type IntervalCall",
				'trace: 38: Found call to replace "jQuery.sap.intervalCall"',
				"trace: 39: Deprecated call of type IntervalCall",
				'trace: 39: Found call to replace "jQuery.sap.intervalCall"',
				"trace: 40: Deprecated call of type IntervalCall",
				'trace: 40: Found call to replace "jQuery.sap.intervalCall"',
				"trace: 41: Deprecated call of type IntervalCall",
				'trace: 41: Found call to replace "jQuery.sap.intervalCall"',
				"trace: 42: Deprecated call of type IntervalCall",
				'trace: 42: Found call to replace "jQuery.sap.intervalCall"',
				"trace: 43: Deprecated call of type IntervalCall",
				'trace: 43: Found call to replace "jQuery.sap.intervalCall"',
				"trace: 46: Deprecated call of type IntervalCall",
				'trace: 46: Found call to replace "jQuery.sap.intervalCall"',
				"trace: 47: Deprecated call of type IntervalCall",
				'trace: 47: Found call to replace "jQuery.sap.intervalCall"',
				'trace: 26: Replaced call "jQuery.sap.intervalCall"',
				'trace: 30: Replaced call "jQuery.sap.intervalCall"',
				'trace: 34: Replaced call "jQuery.sap.intervalCall"',
				'trace: 38: Replaced call "jQuery.sap.intervalCall"',
				'trace: 39: Replaced call "jQuery.sap.intervalCall"',
				'trace: 40: Replaced call "jQuery.sap.intervalCall"',
				'trace: 41: Replaced call "jQuery.sap.intervalCall"',
				'trace: 42: Replaced call "jQuery.sap.intervalCall"',
				'trace: 43: Replaced call "jQuery.sap.intervalCall"',
				'trace: 46: Replaced call "jQuery.sap.intervalCall"',
				'trace: 47: Replaced call "jQuery.sap.intervalCall"',
				'trace: 7: Remove dependency "jquery.sap.script"',
			]);
		});

		it("should replaceGlobals moduleWithInvocation", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "moduleWithInvoc.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "moduleWithInvoc.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "moduleWithInvoc.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 22: Replace global call with "sap.base.util.JSTokenizer"',
				'trace: 22: Found call to replace "jQuery.sap.parseJS"',
				'trace: 24: Replace global call with "sap.base.util.JSTokenizer"',
				'trace: 24: Found call to replace "jQuery.sap.parseJS"',
				'trace: 26: Replace global call with "sap.base.util.JSTokenizer"',
				'trace: 26: Found call to replace "jQuery.sap.parseJS"',
				'trace: 28: Replace global call with "sap.base.util.JSTokenizer"',
				'trace: 28: Found call to replace "jQuery.sap.parseJS"',
				'trace: 28: Replace global call with "sap.base.util.JSTokenizer"',
				'trace: 28: Found call to replace "jQuery.sap.parseJS"',
				'trace: 22: Replaced call "jQuery.sap.parseJS"',
				'trace: 24: Replaced call "jQuery.sap.parseJS"',
				'trace: 26: Replaced call "jQuery.sap.parseJS"',
				'trace: 28: Replaced call "jQuery.sap.parseJS"',
				'trace: 28: Replaced call "jQuery.sap.parseJS"',
				'trace: 7: Add dependency "sap/base/util/JSTokenizer" named "JSTokenizer"',
				'trace: 7: Remove dependency "jquery.sap.script"',
			]);
		});

		it("should replaceGlobals moduleWithWindowScopedInvocation", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "moduleWithScopedInvoc.expected.js"
			);
			const config = JSON.parse(
				fs.readFileSync(
					rootDir + "moduleWithScopedInvoc.config.json",
					"utf8"
				)
			);
			const module = new CustomFileInfo(
				rootDir + "moduleWithScopedInvoc.js"
			);
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 22: Replace global call with "sap.ui.util.Storage"',
				'trace: 22: Found call to replace "jQuery.sap.storage"',
				'trace: 24: Replace global call with "sap.ui.util.Storage"',
				'trace: 24: Found call to replace "jQuery.sap.storage"',
				'trace: 26: Replace global call with "sap.ui.util.Storage"',
				'trace: 26: Found call to replace "jQuery.sap.storage"',
				'trace: 28: Replace global call with "sap.ui.util.Storage"',
				'trace: 28: Found call to replace "jQuery.sap.storage"',
				'trace: 28: Replace global call with "sap.ui.util.Storage"',
				'trace: 28: Found call to replace "jQuery.sap.storage"',
				'trace: 22: Replaced call "jQuery.sap.storage"',
				'trace: 24: Replaced call "jQuery.sap.storage"',
				'trace: 26: Replaced call "jQuery.sap.storage"',
				'trace: 28: Replaced call "jQuery.sap.storage"',
				'trace: 28: Replaced call "jQuery.sap.storage"',
				'trace: 7: Add dependency "sap/ui/util/Storage" named "Storage"',
				'trace: 7: Remove dependency "jquery.sap.storage"',
			]);
		});

		it("should replaceGlobals nativeFunction", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "nativeFunction.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "nativeFunction.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "nativeFunction.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[
					'trace: 22: Replace global call with "eval"',
					'trace: 22: Found call to replace "jQuery.sap.eval"',
					'trace: 24: Replace global call with "eval"',
					'trace: 24: Found call to replace "jQuery.sap.eval"',
					'trace: 22: Replaced call "jQuery.sap.eval"',
					'trace: 24: Replaced call "jQuery.sap.eval"',
					'trace: 7: Remove dependency "jquery.sap.global"',
				],
				"trace",
				"latest",
				[
					{
						fileName: "./test/replaceGlobals/nativeFunction.js",
						location: {
							endColumn: 27,
							endLine: 22,
							startColumn: 12,
							startLine: 22,
						},
						message: "found deprecated global",
						taskName: "replaceGlobals",
					},
					{
						fileName: "./test/replaceGlobals/nativeFunction.js",
						location: {
							endColumn: 35,
							endLine: 24,
							startColumn: 20,
							startLine: 24,
						},
						message: "found deprecated global",
						taskName: "replaceGlobals",
					},
				]
			);
		});

		it("should replaceGlobals nativeFunction with argument check", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "nativeFunctionArgCheck.expected.js"
			);
			const config = JSON.parse(
				fs.readFileSync(
					rootDir + "nativeFunctionArgCheck.config.json",
					"utf8"
				)
			);
			const module = new CustomFileInfo(
				rootDir + "nativeFunctionArgCheck.js"
			);
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 22: Replace global call with "create"',
				'trace: 22: Found call to replace "jQuery.sap.newObject"',
				'trace: 24: Replace global call with "create"',
				'trace: 24: Found call to replace "jQuery.sap.newObject"',
				'trace: 26: Replace global call with "create"',
				'trace: 26: Found call to replace "jQuery.sap.newObject"',
				'trace: 22: Replaced call "jQuery.sap.newObject"',
				'trace: 24: Replaced call "jQuery.sap.newObject"',
				'trace: 26: Replaced call "jQuery.sap.newObject"',
				'trace: 7: Remove dependency "jquery.sap.global"',
			]);
		});

		it("should replaceGlobals nativeObject", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "/nativeObject.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "nativeObject.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "/nativeObject.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 22: Replace global call with "Array.isArray"',
				'trace: 22: Found call to replace "jQuery.isArray"',
				'trace: 23: Replace global call with "Array.isArray"',
				'trace: 23: Found call to replace "jQuery.isArray"',
				'trace: 25: Replace global call with "Array.isArray"',
				'trace: 25: Found call to replace "jQuery.isArray"',
				'trace: 22: Replaced call "jQuery.isArray"',
				'trace: 23: Replaced call "jQuery.isArray"',
				'trace: 25: Replaced call "jQuery.isArray"',
			]);
		});

		it("should replaceGlobals getObject", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "getObject.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "getObject.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "getObject.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 23: Replace global call with "sap.base.util.ObjectPath"',
				'trace: 23: Found call to replace "jQuery.sap.getObject"',
				'trace: 26: Replace global call with "sap.base.util.ObjectPath"',
				'trace: 26: Found call to replace "jQuery.sap.getObject"',
				'trace: 29: Replace global call with "sap.base.util.ObjectPath"',
				'trace: 29: Found call to replace "jQuery.sap.getObject"',
				'trace: 30: Replace global call with "sap.base.util.ObjectPath"',
				'trace: 30: Found call to replace "jQuery.sap.getObject"',
				'trace: 31: Replace global call with "sap.base.util.ObjectPath"',
				'trace: 31: Found call to replace "jQuery.sap.getObject"',
				'trace: 32: Replace global call with "sap.base.util.ObjectPath"',
				'trace: 32: Found call to replace "jQuery.sap.getObject"',
				'trace: 35: Replace global call with "sap.base.util.ObjectPath"',
				'trace: 35: Found call to replace "jQuery.sap.getObject"',
				'trace: 36: Replace global call with "sap.base.util.ObjectPath"',
				'trace: 36: Found call to replace "jQuery.sap.getObject"',
				'trace: 37: Replace global call with "sap.base.util.ObjectPath"',
				'trace: 37: Found call to replace "jQuery.sap.getObject"',
				'trace: 38: Replace global call with "sap.base.util.ObjectPath"',
				'trace: 38: Found call to replace "jQuery.sap.getObject"',
				'trace: 41: Replace global call with "sap.base.util.ObjectPath"',
				'trace: 41: Found call to replace "jQuery.sap.getObject"',
				'trace: 42: Replace global call with "sap.base.util.ObjectPath"',
				'trace: 42: Found call to replace "jQuery.sap.getObject"',
				'trace: 23: Replaced call "jQuery.sap.getObject"',
				'trace: 26: Replaced call "jQuery.sap.getObject"',
				'trace: 29: Replaced call "jQuery.sap.getObject"',
				'trace: 30: Replaced call "jQuery.sap.getObject"',
				'trace: 31: Replaced call "jQuery.sap.getObject"',
				"debug: 32: ignored element: jQuery.sap.getObject",
				"error: 32: Error: Failed to replace getObject. Cannot determine 2nd or 3rd parameter",
				'trace: 35: Replaced call "jQuery.sap.getObject"',
				'trace: 36: Replaced call "jQuery.sap.getObject"',
				'trace: 37: Replaced call "jQuery.sap.getObject"',
				"debug: 38: ignored element: jQuery.sap.getObject",
				"error: 38: Error: Failed to replace getObject. Cannot determine 2nd or 3rd parameter",
				'trace: 41: Replaced call "jQuery.sap.getObject"',
				'trace: 42: Replaced call "jQuery.sap.getObject"',
				'trace: 7: Add dependency "sap/base/util/ObjectPath" named "ObjectPath"',
			]);
		});

		it("should replaceGlobals domFocus", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "domFocus.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "domFocus.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "domFocus.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				"trace: 12: Deprecated call of type domFocus",
				'trace: 12: Found call to replace "jQuery.sap.focus"',
				"trace: 14: Deprecated call of type domFocus",
				'trace: 14: Found call to replace "jQuery.sap.focus"',
				"trace: 16: Deprecated call of type domFocus",
				'trace: 16: Found call to replace "jQuery.sap.focus"',
				"trace: 20: Deprecated call of type domFocus",
				'trace: 20: Found call to replace "jQuery.sap.focus"',
				"trace: 22: Deprecated call of type domFocus",
				'trace: 22: Found call to replace "jQuery.sap.focus"',
				"trace: 24: Deprecated call of type domFocus",
				'trace: 24: Found call to replace "jQuery.sap.focus"',
				"trace: 26: Deprecated call of type domFocus",
				'trace: 26: Found call to replace "jQuery.sap.focus"',
				"trace: 30: Deprecated call of type domFocus",
				'trace: 30: Found call to replace "jQuery.sap.focus"',
				'trace: 12: Replaced call "abc.focus"',
				'trace: 14: Replaced call "jQuery.sap.focus"',
				'trace: 16: Replaced call "b.focus"',
				'trace: 20: Replaced call "jQuery.sap.focus"',
				'trace: 22: Replaced call "jQuery.sap.focus"',
				'trace: 24: Replaced call "jQuery.sap.focus"',
				'trace: 26: Replaced call "jQuery.sap.focus"',
				"debug: 30: ignored element: jQuery.sap.focus",
				"error: 30: Error: insertion is of type MemberExpression(supported are only Call-Expressions)",
			]);
		});

		it("should replaceGlobals comments", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "comments.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "comments.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "comments.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				"trace: 15: Deprecated call of type LEAVE",
				'trace: 15: Found call to replace "jQuery.unhandled"',
				"trace: 17: Deprecated call of type LEAVE",
				'trace: 17: Found call to replace "jQuery.unhandled"',
				"trace: 21: Deprecated call of type LEAVE",
				'trace: 21: Found call to replace "jQuery.unhandled"',
				"trace: 24: Deprecated call of type LEAVE",
				'trace: 24: Found call to replace "jQuery.unhandled"',
				"trace: 26: Deprecated call of type LEAVE",
				'trace: 26: Found call to replace "jQuery.unhandled"',
				"trace: 30: Deprecated call of type LEAVE",
				'trace: 30: Found call to replace "jQuery.unhandled"',
				"trace: 31: Deprecated call of type LEAVE",
				'trace: 31: Found call to replace "jQuery.unhandled"',
				"trace: 36: Deprecated call of type LEAVE",
				'trace: 36: Found call to replace "jQuery.unhandled"',
				"trace: 37: Deprecated call of type LEAVE",
				'trace: 37: Found call to replace "jQuery.unhandled"',
				"debug: 15: ignored element: jQuery.unhandled",
				"error: 15: Error: Ignore",
				"debug: 17: ignored element: jQuery.unhandled",
				"error: 17: Error: Ignore",
				"debug: 21: ignored element: jQuery.unhandled",
				"error: 21: Error: Ignore",
				"debug: 24: ignored element: jQuery.unhandled",
				"error: 24: Error: Ignore",
				"debug: 26: ignored element: jQuery.unhandled",
				"error: 26: Error: Ignore",
				"debug: 30: ignored element: jQuery.unhandled",
				"error: 30: Error: Ignore",
				"debug: 31: ignored element: jQuery.unhandled",
				"error: 31: Error: Ignore",
				"debug: 36: ignored element: jQuery.unhandled",
				"error: 36: Error: Ignore",
				"debug: 37: ignored element: jQuery.unhandled",
				"error: 37: Error: Ignore",
			]);
		});

		it("should ignore non-root sap.ui.define calls", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "nonRoot.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "nonRoot.config.json")
			);
			const module = new CustomFileInfo(rootDir + "nonRoot.js");
			analyseMigrateAndTest(
				module,
				false,
				expectedContent,
				config,
				done,
				["trace: could not find sap.ui.define call"],
				"trace"
			);
		});

		it("should replace measure calls", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "measure.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "measure.config.json")
			);
			const module = new CustomFileInfo(rootDir + "measure.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 25: Replace global call with "sap.ui.performance.Measurement"',
				'trace: 25: Found call to replace "jQuery.sap.measure.start"',
				'trace: 26: Replace global call with "sap.ui.performance.Measurement"',
				'trace: 26: Found call to replace "jQuery.sap.measure.start"',
				'trace: 27: Replace global call with "sap.ui.performance.Measurement"',
				'trace: 27: Found call to replace "jQuery.sap.measure.start"',
				'trace: 25: Replaced call "jQuery.sap.measure.start"',
				'trace: 26: Replaced call "jQuery.sap.measure.start"',
				'trace: 27: Replaced call "jQuery.sap.measure.start"',
				'trace: 7: Add dependency "sap/ui/performance/Measurement" named "Measurement"',
				'trace: 7: Remove dependency "jquery.sap.global"',
			]);
		});

		it("should replace old storage api", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "storage.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "storage.config.json")
			);
			const module = new CustomFileInfo(rootDir + "storage.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 22: Replace global call with "sap.ui.util.Storage"',
				'trace: 22: Found call to replace "jQuery.sap.storage.Type.local"',
				'trace: 23: Replace global call with "sap.ui.util.Storage"',
				'trace: 23: Found call to replace "jQuery.sap.storage.Storage"',
				'trace: 24: Replace global call with "sap.ui.util.Storage"',
				'trace: 24: Found call to replace "jQuery.sap.storage.Type.local"',
				'trace: 24: Replace global call with "sap.ui.util.Storage"',
				'trace: 24: Found call to replace "jQuery.sap.storage"',
				'trace: 26: Replace global call with "sap.ui.util.Storage"',
				'trace: 26: Found call to replace "$.sap.storage.Type.local"',
				'trace: 27: Replace global call with "sap.ui.util.Storage"',
				'trace: 27: Found call to replace "$.sap.storage.Storage"',
				'trace: 28: Replace global call with "sap.ui.util.Storage"',
				'trace: 28: Found call to replace "$.sap.storage.Type.local"',
				'trace: 28: Replace global call with "sap.ui.util.Storage"',
				'trace: 28: Found call to replace "$.sap.storage"',
				'trace: 29: Replace global call with "sap.ui.util.Storage"',
				'trace: 29: Found call to replace "$.sap.storage.Type.local"',
				'trace: 22: Replaced call "jQuery.sap.storage.Type"',
				'trace: 23: Replaced call "jQuery.sap.storage.Storage"',
				'trace: 24: Replaced call "jQuery.sap.storage.Type"',
				'trace: 24: Replaced call "jQuery.sap.storage"',
				'trace: 26: Replaced call "$.sap.storage.Type"',
				'trace: 27: Replaced call "$.sap.storage.Storage"',
				'trace: 28: Replaced call "$.sap.storage.Type"',
				'trace: 28: Replaced call "$.sap.storage"',
				'trace: 29: Replaced call "$.sap.storage.Type"',
			]);
		});

		it("should replace version calls", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "version.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "version.config.json")
			);
			const module = new CustomFileInfo(rootDir + "version.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 24: Replace global call with "sap.base.Version"',
				'trace: 24: Found call to replace "jQuery.sap.Version"',
				'trace: 27: Replace global call with "sap.base.Version"',
				'trace: 27: Found call to replace "jQuery.sap.Version"',
				'trace: 24: Replaced call "jQuery.sap.Version"',
				'trace: 27: Replaced call "jQuery.sap.Version"',
				'trace: 7: Add dependency "sap/base/Version" named "Version"',
				'trace: 7: Remove dependency "jquery.sap.global"',
			]);
		});

		it("should replace log Level calls calls", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "loglevel.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "loglevel.config.json")
			);
			const module = new CustomFileInfo(rootDir + "loglevel.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 23: Replace global call with "sap.base.Log"',
				'trace: 23: Found call to replace "jQuery.sap.log.Level.FATAL"',
				'trace: 23: Replace global call with "sap.base.Log"',
				'trace: 23: Found call to replace "jQuery.sap.log.Level.ERROR"',
				'trace: 27: Replace global call with "sap.base.Log"',
				'trace: 27: Found call to replace "jQuery.sap.log.LogLevel.FATAL"',
				'trace: 27: Replace global call with "sap.base.Log"',
				'trace: 27: Found call to replace "jQuery.sap.log.LogLevel.ERROR"',
				'trace: 31: Replace global call with "sap.base.Log"',
				'trace: 31: Found call to replace "jQuery.sap.log.LogLevel.ERROR"',
				'trace: 23: Replaced call "jQuery.sap.log.Level"',
				'trace: 23: Replaced call "jQuery.sap.log.Level"',
				'trace: 27: Replaced call "jQuery.sap.log.LogLevel"',
				'trace: 27: Replaced call "jQuery.sap.log.LogLevel"',
				'trace: 31: Replaced call "jQuery.sap.log.LogLevel"',
				'trace: 7: Add dependency "sap/base/Log" named "Log"',
				'trace: 7: Remove dependency "jquery.sap.global"',
			]);
		});

		it("jquery should be left as is", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jquery.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "jquery.config.json")
			);
			const module = new CustomFileInfo(rootDir + "jquery.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 25: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 25: Found call to replace "jQuery.extend"',
				'trace: 22: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 22: Found call to replace "jQuery"',
				'trace: 25: Replaced call "jQuery.extend"',
				'trace: 22: Replaced call "jQuery"',
				'trace: 7: Modify dependency "sap/ui/thirdparty/jquery" named "jQuery"',
			]);
		});

		it("jquery ThirdParty should be left as is", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jqueryThirdParty.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "jqueryThirdParty.config.json")
			);
			const module = new CustomFileInfo(rootDir + "jqueryThirdParty.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 25: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 25: Found call to replace "jQuery.extend"',
				'trace: 22: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 22: Found call to replace "jQuery"',
				'trace: 25: Replaced call "jQuery.extend"',
				'trace: 22: Replaced call "jQuery"',
				'trace: 7: Modify dependency "sap/ui/thirdparty/jquery" named "jQuery"',
			]);
		});

		it("ResourceBundle is Bundle should be left as is", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "RisBundle.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "RisBundle.config.json")
			);
			const module = new CustomFileInfo(rootDir + "RisBundle.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 22: Replace global call with "sap.base.i18n.ResourceBundle"',
				'trace: 22: Found call to replace "jQuery.sap.resources.isBundle"',
				'trace: 23: Replace global call with "sap.base.i18n.ResourceBundle"',
				'trace: 23: Found call to replace "jQuery.sap.resources"',
				'trace: 25: Replace global call with "sap.base.i18n.ResourceBundle"',
				'trace: 25: Found call to replace "jQuery.sap.resources.isBundle"',
				'trace: 22: Replaced call "jQuery.sap.resources.isBundle"',
				'trace: 23: Replaced call "jQuery.sap.resources"',
				'trace: 25: Replaced call "jQuery.sap.resources.isBundle"',
				'trace: 7: Add dependency "sap/base/i18n/ResourceBundle" named "ResourceBundle"',
				'trace: 7: Remove dependency "jquery.sap.resources"',
			]);
		});

		it("jquery support retina", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "retina.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "retina.config.json")
			);
			const module = new CustomFileInfo(rootDir + "retina.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				"trace: 22: Deprecated call of type RetinaSupport",
				'trace: 22: Found call to replace "jQuery.support.retina"',
				"trace: 25: Deprecated call of type RetinaSupport",
				'trace: 25: Found call to replace "jQuery.support.retina"',
				'trace: 22: Replaced call "jQuery.support.retina"',
				'trace: 25: Replaced call "jQuery.support.retina"',
				'trace: 7: Remove dependency "jquery.sap.mobile"',
			]);
		});

		it("jquery os", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jqueryos.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "jqueryos.config.json")
			);
			const module = new CustomFileInfo(rootDir + "jqueryos.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 23: Replace global call with "sap.ui.Device"',
				'trace: 23: Found call to replace "jQuery.os.os"',
				'trace: 24: Replace global call with "sap.ui.Device"',
				'trace: 24: Found call to replace "jQuery.os.os"',
				'trace: 22: Replace global call with "sap.ui.Device"',
				'trace: 22: Found call to replace "jQuery.os.os"',
				'trace: 23: Replaced call "jQuery.os.os"',
				'trace: 24: Replaced call "jQuery.os.os"',
				'trace: 22: Replaced call "jQuery.os.os"',
				'trace: 7: Add dependency "sap/ui/Device" named "Device"',
				'trace: 7: Remove dependency "jquery.sap.mobile"',
			]);
		});

		it("jquery os require", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jqueryos.require.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "jqueryos.require.config.json")
			);
			const module = new CustomFileInfo(rootDir + "jqueryos.require.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 23: Replace global call with "sap.ui.Device"',
				'trace: 23: Found call to replace "jQuery.os.os"',
				'trace: 24: Replace global call with "sap.ui.Device"',
				'trace: 24: Found call to replace "jQuery.os.os"',
				'trace: 22: Replace global call with "sap.ui.Device"',
				'trace: 22: Found call to replace "jQuery.os.os"',
				'trace: 23: Replaced call "jQuery.os.os"',
				'trace: 24: Replaced call "jQuery.os.os"',
				'trace: 22: Replaced call "jQuery.os.os"',
				'trace: 7: Add dependency "sap/ui/Device" named "Device"',
				'trace: 7: Remove dependency "jquery.sap.mobile"',
			]);
		});

		it("jquery os invalid require", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jqueryos.invalid.require.expected.js"
			);
			const config = JSON.parse(
				fs.readFileSync(
					rootDir + "jqueryos.invalid.require.config.json"
				)
			);
			const module = new CustomFileInfo(
				rootDir + "jqueryos.invalid.require.js"
			);
			analyseMigrateAndTest(
				module,
				false,
				expectedContent,
				config,
				done,
				["" + "trace: could not find sap.ui.define call"],
				"trace"
			);
		});

		it("jquery os name", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jqueryosname.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "jqueryosname.config.json")
			);
			const module = new CustomFileInfo(rootDir + "jqueryosname.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 23: Replace global call with "sap.ui.Device"',
				'trace: 23: Found call to replace "jQuery.os.win"',
				'trace: 24: Replace global call with "sap.ui.Device"',
				'trace: 24: Found call to replace "jQuery.os.win"',
				'trace: 22: Replace global call with "sap.ui.Device"',
				'trace: 22: Found call to replace "jQuery.os.win"',
				'trace: 23: Replaced call "jQuery.os.win"',
				'trace: 24: Replaced call "jQuery.os.win"',
				'trace: 22: Replaced call "jQuery.os.win"',
				'trace: 7: Add dependency "sap/ui/Device" named "Device"',
				'trace: 7: Remove dependency "jquery.sap.mobile"',
			]);
		});

		it("jquery device is standalone", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jquerydeviceisstandalone.expected.js"
			);
			const config = JSON.parse(
				fs.readFileSync(
					rootDir + "jquerydeviceisstandalone.config.json"
				)
			);
			const module = new CustomFileInfo(
				rootDir + "jquerydeviceisstandalone.js"
			);
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 23: Replace global call with "window.navigator.standalone"',
				'trace: 23: Found call to replace "jQuery.device.is.standalone"',
				'trace: 24: Replace global call with "window.navigator.standalone"',
				'trace: 24: Found call to replace "jQuery.device.is.standalone"',
				'trace: 22: Replace global call with "window.navigator.standalone"',
				'trace: 22: Found call to replace "jQuery.device.is.standalone"',
				'trace: 23: Replaced call "jQuery.device.is.standalone"',
				'trace: 24: Replaced call "jQuery.device.is.standalone"',
				'trace: 22: Replaced call "jQuery.device.is.standalone"',
			]);
		});

		it("jquery device is iphone", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jquerydeviceisiphone.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "jquerydeviceisiphone.config.json")
			);
			const module = new CustomFileInfo(
				rootDir + "jquerydeviceisiphone.js"
			);
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 23: Replace global call with "sap.ui.Device"',
				'trace: 23: Found call to replace "jQuery.device.is.iphone"',
				'trace: 24: Replace global call with "sap.ui.Device"',
				'trace: 24: Found call to replace "jQuery.device.is.iphone"',
				'trace: 22: Replace global call with "sap.ui.Device"',
				'trace: 22: Found call to replace "jQuery.device.is.iphone"',
				'trace: 23: Replaced call "jQuery.device.is.iphone"',
				'trace: 24: Replaced call "jQuery.device.is.iphone"',
				'trace: 22: Replaced call "jQuery.device.is.iphone"',
				'trace: 7: Add dependency "sap/ui/Device" named "Device"',
			]);
		});

		it("should AddComment", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "addcomment.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "addcomment.config.json")
			);
			const module = new CustomFileInfo(rootDir + "addcomment.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				"trace: 22: Deprecated call of type AddComment",
				'trace: 22: Found call to replace "jQuery.sap.globalEval"',
				"trace: 24: Deprecated call of type AddComment",
				'trace: 24: Found call to replace "jQuery.sap.globalEval"',
				'trace: 22: Replaced call "jQuery.sap.globalEval"',
				'trace: 24: Replaced call "jQuery.sap.globalEval"',
			]);
		});

		it("should not remove dependency when assigning", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "assignmodfunc.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "assignmodfunc.config.json")
			);
			const module = new CustomFileInfo(rootDir + "assignmodfunc.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[
					'trace: 16: Replace global call with "do.not.import"',
					'trace: 16: Found call to replace "jQuery.sap.func"',
					'trace: 16: Replaced call "jQuery.sap.func"',
				],
				"trace",
				"latest",
				[
					{
						fileName: "./test/replaceGlobals/assignmodfunc.js",
						location: {
							endColumn: 23,
							endLine: 16,
							startColumn: 8,
							startLine: 16,
						},
						message: "found deprecated global",
						taskName: "replaceGlobals",
					},
				]
			);
		});

		it("should be able to replace it as part of the arguments (array)", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "mock.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "mock.config.json")
			);
			const module = new CustomFileInfo(rootDir + "mock.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[
					'trace: 22: Replace global call with "sap.base.Log"',
					'trace: 22: Found call to replace "jQuery.sap.log"',
					'trace: 22: Replaced call "jQuery.sap.log"',
					'trace: 7: Add dependency "sap/base/Log" named "Log"',
					'trace: 7: Remove dependency "jquery.sap.global"',
				],
				"trace",
				"latest",
				[
					{
						fileName: "./test/replaceGlobals/mock.js",
						location: {
							endColumn: 32,
							endLine: 22,
							startColumn: 18,
							startLine: 22,
						},
						message: "found deprecated global",
						taskName: "replaceGlobals",
					},
				]
			);
		});

		it("should set import names if necessary", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "unset_global.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "unset_global.config.json")
			);
			const module = new CustomFileInfo(rootDir + "unset_global.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 22: Replace global call with "newA"',
				'trace: 22: Found call to replace "a.fnct"',
				'trace: 23: Replace global call with "newB"',
				'trace: 23: Found call to replace "b.fnct"',
				'trace: 26: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 26: Found call to replace "jQuery"',
				'trace: 22: Replaced call "a.fnct"',
				'trace: 23: Replaced call "b.fnct"',
				'trace: 26: Replaced call "jQuery"',
				'trace: 7: Add dependency "newA" named "newA"',
				'trace: 7: Add dependency "newB" named "newB"',
				'trace: 7: Add dependency "sap/ui/thirdparty/jquery" named "jQuery"',
				'trace: 7: Remove dependency "a"',
				'trace: 7: Remove dependency "b"',
			]);
		});

		it("should generate Getter", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "getter.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "getter.config.json")
			);
			const module = new CustomFileInfo(rootDir + "getter.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				"trace: 16: Deprecated call of type Getter",
				'trace: 16: Found call to replace "jQuery.sap.getter"',
				"trace: 18: Deprecated call of type Getter",
				'trace: 18: Found call to replace "jQuery.sap.getter"',
				"trace: 20: Deprecated call of type Getter",
				'trace: 20: Found call to replace "jQuery.sap.getter"',
				"trace: 22: Deprecated call of type Getter",
				'trace: 22: Found call to replace "jQuery.sap.getter"',
				'trace: 16: Replaced call "jQuery.sap.getter"',
				'trace: 18: Replaced call "jQuery.sap.getter"',
				'trace: 20: Replaced call "jQuery.sap.getter"',
				'trace: 22: Replaced call "jQuery.sap.getter"',
				'trace: 7: Remove dependency "jquery.sap.global"',
			]);
		});

		it("jstokenizer replacement with new", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jstokenizer.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "jstokenizer.config.json")
			);
			const module = new CustomFileInfo(rootDir + "jstokenizer.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 23: Replace global call with "sap.base.util.JSTokenizer"',
				'trace: 23: Found call to replace "jQuery.sap._createJSTokenizer"',
				'trace: 25: Replace global call with "sap.base.util.JSTokenizer"',
				'trace: 25: Found call to replace "jQuery.sap.parseJS"',
				'trace: 26: Replace global call with "sap.base.util.JSTokenizer"',
				'trace: 26: Found call to replace "jQuery.sap.parseJS"',
				'trace: 27: Replace global call with "sap.base.util.JSTokenizer"',
				'trace: 27: Found call to replace "jQuery.sap.parseJS"',
				'trace: 22: Replace global call with "sap.base.util.JSTokenizer"',
				'trace: 22: Found call to replace "jQuery.sap.parseJS"',
				'trace: 23: Replaced call "jQuery.sap._createJSTokenizer"',
				'trace: 25: Replaced call "jQuery.sap.parseJS"',
				'trace: 26: Replaced call "jQuery.sap.parseJS"',
				'trace: 27: Replaced call "jQuery.sap.parseJS"',
				'trace: 22: Replaced call "jQuery.sap.parseJS"',
				'trace: 7: Add dependency "sap/base/util/JSTokenizer" named "JSTokenizer"',
				'trace: 7: Remove dependency "jquery.sap.script"',
			]);
		});

		it("should generate noop functions", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "gennoop.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "gennoop.config.json")
			);
			const module = new CustomFileInfo(rootDir + "gennoop.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				"debug: possible shortcut found:a $.noop (jquery.sap.global.noop)",
				"trace: 10: Deprecated call of type GenNOOP",
				'trace: 10: Found call to replace "$.noop"',
				"trace: 13: Deprecated call of type GenNOOP",
				'trace: 13: Found call to replace "$.noop"',
				"trace: 16: Deprecated call of type GenNOOP",
				'trace: 16: Found call to replace "$.noop"',
				'trace: 10: Replaced call "$.noop"',
				'trace: 13: Replaced call "$.noop"',
				'trace: 16: Replaced call "$.noop"',
				'trace: 7: Remove dependency "jquery.sap.global"',
			]);
		});

		it("should generate no duplicate jquery parameters", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "duplication.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "duplication.config.json")
			);
			const module = new CustomFileInfo(rootDir + "duplication.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 22: Replace global call with "LEAVE"',
				'trace: 22: Found call to replace "jQuery.sap.require"',
				'trace: 24: Replace global call with "sap.base.log"',
				'trace: 24: Found call to replace "jQuery.sap.log.Level.ERROR"',
				'trace: 24: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 24: Found call to replace "jQuery"',
				"debug: 22: ignored element: jQuery.sap.require",
				"error: 22: Error: Ignore",
				'trace: 24: Replaced call "jQuery.sap.log.Level"',
				'trace: 24: Replaced call "jQuery"',
				'trace: 7: Add dependency "sap/base/log" named "Log"',
				'trace: 7: Add dependency "sap/ui/thirdparty/jquery" named "jQuery0"',
			]);
		});

		it("should replace each calls", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "each.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "each.config.json")
			);
			const module = new CustomFileInfo(rootDir + "each.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 23: Replace global call with "sap.base.util.each"',
				'trace: 23: Found call to replace "jQuery.each"',
				'trace: 29: Replace global call with "sap.base.util.each"',
				'trace: 29: Found call to replace "jQuery.sap.each"',
				'trace: 34: Replace global call with "sap.base.util.each"',
				'trace: 34: Found call to replace "jQuery.each"',
				'trace: 23: Replaced call "jQuery.each"',
				'trace: 29: Replaced call "jQuery.sap.each"',
				'trace: 34: Replaced call "jQuery.each"',
				'trace: 7: Add dependency "sap/base/util/each" named "each"',
				'trace: 7: Remove dependency "jquery.sap.script"',
			]);
		});

		it("should handle missing dependencies", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "missingDependency.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "missingDependency.config.json")
			);
			const module = new CustomFileInfo(rootDir + "missingDependency.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 24: Replace global call with "sap.ui.events.isMouseEventDelayed"',
				'trace: 24: Found call to replace "jQuery.sap.isMouseEventDelayed"',
				'trace: 25: Replace global call with "sap.ui.events.isMouseEventDelayed"',
				'trace: 25: Found call to replace "jQuery.sap.isMouseEventDelayed"',
				'trace: 23: Replace global call with "sap.ui.events.isMouseEventDelayed"',
				'trace: 23: Found call to replace "jQuery.sap.isMouseEventDelayed"',
				'trace: 28: Replace global call with "sap.ui.events.isMouseEventDelayed"',
				'trace: 28: Found call to replace "jQuery.sap.isMouseEventDelayed"',
				'trace: 27: Replace global call with "sap.ui.events.isMouseEventDelayed"',
				'trace: 27: Found call to replace "jQuery.sap.isMouseEventDelayed"',
				'trace: 31: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 31: Found call to replace "jQuery.extend"',
				'trace: 24: Replaced call "jQuery.sap.isMouseEventDelayed"',
				'trace: 25: Replaced call "jQuery.sap.isMouseEventDelayed"',
				'trace: 23: Replaced call "jQuery.sap.isMouseEventDelayed"',
				'trace: 28: Replaced call "jQuery.sap.isMouseEventDelayed"',
				'trace: 27: Replaced call "jQuery.sap.isMouseEventDelayed"',
				'trace: 31: Replaced call "jQuery.extend"',
				'trace: 7: Add dependency "sap/ui/events/isMouseEventDelayed" named "isMouseEventDelayed"',
				'trace: 7: Modify dependency "sap/ui/thirdparty/jquery" named "jQuery"',
				'trace: 7: Remove dependency "jquery.sap.events"',
			]);
		});

		it("should replace setObject", function (done) {
			// increase test timeout since this test is long running
			this.timeout(5000);

			const expectedContent = fs.readFileSync(
				rootDir + "setObject.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "setObject.config.json")
			);
			const module = new CustomFileInfo(rootDir + "setObject.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 26: Replace global call with "sap.base.util.getObject"',
				'trace: 26: Found call to replace "jQuery.sap.setObject"',
				'trace: 27: Replace global call with "sap.base.util.getObject"',
				'trace: 27: Found call to replace "jQuery.sap.setObject"',
				'trace: 28: Replace global call with "sap.base.util.getObject"',
				'trace: 28: Found call to replace "jQuery.sap.setObject"',
				'trace: 30: Replace global call with "sap.base.util.getObject"',
				'trace: 30: Found call to replace "jQuery.sap.setObject"',
				'trace: 31: Replace global call with "sap.base.util.getObject"',
				'trace: 31: Found call to replace "jQuery.sap.setObject"',
				'trace: 26: Replaced call "jQuery.sap.setObject"',
				'trace: 27: Replaced call "jQuery.sap.setObject"',
				'trace: 28: Replaced call "jQuery.sap.setObject"',
				'trace: 30: Replaced call "jQuery.sap.setObject"',
				'trace: 31: Replaced call "jQuery.sap.setObject"',
				'trace: 7: Add dependency "sap/base/util/getObject" named "getObject"',
				'trace: 7: Remove dependency "jquery.sap.global"',
			]);
		});

		it("should replace endsWithIgnoreCase", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "endsWithIgnoreCase.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "endsWithIgnoreCase.config.json")
			);
			const module = new CustomFileInfo(
				rootDir + "endsWithIgnoreCase.js"
			);
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				"trace: 24: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 24: Found call to replace "jQuery.sap.endsWithIgnoreCase"',
				"trace: 30: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 30: Found call to replace "jQuery.sap.endsWithIgnoreCase"',
				"trace: 32: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 32: Found call to replace "jQuery.sap.endsWithIgnoreCase"',
				"trace: 33: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 33: Found call to replace "jQuery.sap.endsWithIgnoreCase"',
				"trace: 34: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 34: Found call to replace "jQuery.sap.endsWithIgnoreCase"',
				"trace: 44: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 44: Found call to replace "jQuery.sap.endsWithIgnoreCase"',
				"trace: 46: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 46: Found call to replace "jQuery.sap.endsWithIgnoreCase"',
				"trace: 48: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 48: Found call to replace "jQuery.sap.endsWithIgnoreCase"',
				'trace: 24: Replaced call "jQuery.sap.endsWithIgnoreCase"',
				'trace: 30: Replaced call "jQuery.sap.endsWithIgnoreCase"',
				'trace: 32: Replaced call "jQuery.sap.endsWithIgnoreCase"',
				'trace: 33: Replaced call "jQuery.sap.endsWithIgnoreCase"',
				'trace: 34: Replaced call "jQuery.sap.endsWithIgnoreCase"',
				'trace: 44: Replaced call "jQuery.sap.endsWithIgnoreCase"',
				'trace: 46: Replaced call "jQuery.sap.endsWithIgnoreCase"',
				'trace: 48: Replaced call "jQuery.sap.endsWithIgnoreCase"',
			]);
		});

		it("should replace startsWithIgnoreCase", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "startsWithIgnoreCase.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "startsWithIgnoreCase.config.json")
			);
			const module = new CustomFileInfo(
				rootDir + "startsWithIgnoreCase.js"
			);
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				"trace: 24: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 24: Found call to replace "jQuery.sap.startsWithIgnoreCase"',
				"trace: 30: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 30: Found call to replace "jQuery.sap.startsWithIgnoreCase"',
				"trace: 32: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 32: Found call to replace "jQuery.sap.startsWithIgnoreCase"',
				"trace: 36: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 36: Found call to replace "jQuery.sap.startsWithIgnoreCase"',
				"trace: 40: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 40: Found call to replace "jQuery.sap.startsWithIgnoreCase"',
				"trace: 41: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 41: Found call to replace "jQuery.sap.startsWithIgnoreCase"',
				"trace: 42: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 42: Found call to replace "jQuery.sap.startsWithIgnoreCase"',
				"trace: 52: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 52: Found call to replace "jQuery.sap.startsWithIgnoreCase"',
				"trace: 54: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 54: Found call to replace "jQuery.sap.startsWithIgnoreCase"',
				"trace: 56: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 56: Found call to replace "jQuery.sap.startsWithIgnoreCase"',
				"trace: 58: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 58: Found call to replace "jQuery.sap.startsWithIgnoreCase"',
				"trace: 60: Deprecated call of type startsOrEndsWithIgnoreCase",
				'trace: 60: Found call to replace "jQuery.sap.startsWithIgnoreCase"',
				'trace: 24: Replaced call "jQuery.sap.startsWithIgnoreCase"',
				'trace: 30: Replaced call "jQuery.sap.startsWithIgnoreCase"',
				'trace: 32: Replaced call "jQuery.sap.startsWithIgnoreCase"',
				'trace: 36: Replaced call "jQuery.sap.startsWithIgnoreCase"',
				'trace: 40: Replaced call "jQuery.sap.startsWithIgnoreCase"',
				'trace: 41: Replaced call "jQuery.sap.startsWithIgnoreCase"',
				'trace: 42: Replaced call "jQuery.sap.startsWithIgnoreCase"',
				'trace: 52: Replaced call "jQuery.sap.startsWithIgnoreCase"',
				'trace: 54: Replaced call "jQuery.sap.startsWithIgnoreCase"',
				'trace: 56: Replaced call "jQuery.sap.startsWithIgnoreCase"',
				'trace: 58: Replaced call "jQuery.sap.startsWithIgnoreCase"',
				'trace: 60: Replaced call "jQuery.sap.startsWithIgnoreCase"',
			]);
		});

		it("resourceModulePaths", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "resourceModulePaths.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "resourceModulePaths.config.json")
			);
			const module = new CustomFileInfo(
				rootDir + "resourceModulePaths.js"
			);
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 6: Replace global call with "sap.ui.require.toUrl"',
				'trace: 6: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 8: Replace global call with "sap.ui.require.toUrl"',
				'trace: 8: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 9: Replace global call with "sap.ui.require.toUrl"',
				'trace: 9: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 7: Replace global call with "sap.ui.require.toUrl"',
				'trace: 7: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 13: Replace global call with "sap.ui.require.toUrl"',
				'trace: 13: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 14: Replace global call with "sap.ui.require.toUrl"',
				'trace: 14: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 15: Replace global call with "sap.ui.require.toUrl"',
				'trace: 15: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 16: Replace global call with "sap.ui.require.toUrl"',
				'trace: 16: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 17: Replace global call with "sap.ui.require.toUrl"',
				'trace: 17: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 18: Replace global call with "sap.ui.require.toUrl"',
				'trace: 18: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 19: Replace global call with "sap.ui.require.toUrl"',
				'trace: 19: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 20: Replace global call with "sap.ui.require.toUrl"',
				'trace: 20: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 21: Replace global call with "sap.ui.require.toUrl"',
				'trace: 21: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 24: Replace global call with "sap.ui.require.toUrl"',
				'trace: 24: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 25: Replace global call with "sap.ui.require.toUrl"',
				'trace: 25: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 26: Replace global call with "sap.ui.require.toUrl"',
				'trace: 26: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 27: Replace global call with "sap.ui.require.toUrl"',
				'trace: 27: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 28: Replace global call with "sap.ui.require.toUrl"',
				'trace: 28: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 29: Replace global call with "sap.ui.require.toUrl"',
				'trace: 29: Found call to replace "jQuery.sap.getModulePath"',
				'trace: 32: Replace global call with "sap.ui.require.toUrl"',
				'trace: 32: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 34: Replace global call with "sap.ui.require.toUrl"',
				'trace: 34: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 35: Replace global call with "sap.ui.require.toUrl"',
				'trace: 35: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 33: Replace global call with "sap.ui.require.toUrl"',
				'trace: 33: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 39: Replace global call with "sap.ui.require.toUrl"',
				'trace: 39: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 40: Replace global call with "sap.ui.require.toUrl"',
				'trace: 40: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 41: Replace global call with "sap.ui.require.toUrl"',
				'trace: 41: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 42: Replace global call with "sap.ui.require.toUrl"',
				'trace: 42: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 43: Replace global call with "sap.ui.require.toUrl"',
				'trace: 43: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 44: Replace global call with "sap.ui.require.toUrl"',
				'trace: 44: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 45: Replace global call with "sap.ui.require.toUrl"',
				'trace: 45: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 48: Replace global call with "sap.ui.require.toUrl"',
				'trace: 48: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 49: Replace global call with "sap.ui.require.toUrl"',
				'trace: 49: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 50: Replace global call with "sap.ui.require.toUrl"',
				'trace: 50: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 51: Replace global call with "sap.ui.require.toUrl"',
				'trace: 51: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 52: Replace global call with "sap.ui.require.toUrl"',
				'trace: 52: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 53: Replace global call with "sap.ui.require.toUrl"',
				'trace: 53: Found call to replace "jQuery.sap.getResourcePath"',
				'trace: 6: Replaced call "jQuery.sap.getModulePath"',
				'trace: 8: Replaced call "jQuery.sap.getModulePath"',
				'trace: 9: Replaced call "jQuery.sap.getModulePath"',
				'trace: 7: Replaced call "jQuery.sap.getModulePath"',
				'trace: 13: Replaced call "jQuery.sap.getModulePath"',
				'trace: 14: Replaced call "jQuery.sap.getModulePath"',
				'trace: 15: Replaced call "jQuery.sap.getModulePath"',
				'trace: 16: Replaced call "jQuery.sap.getModulePath"',
				'trace: 17: Replaced call "jQuery.sap.getModulePath"',
				'trace: 18: Replaced call "jQuery.sap.getModulePath"',
				'trace: 19: Replaced call "jQuery.sap.getModulePath"',
				'trace: 20: Replaced call "jQuery.sap.getModulePath"',
				'trace: 21: Replaced call "jQuery.sap.getModulePath"',
				'trace: 24: Replaced call "jQuery.sap.getModulePath"',
				'trace: 25: Replaced call "jQuery.sap.getModulePath"',
				'trace: 26: Replaced call "jQuery.sap.getModulePath"',
				'trace: 27: Replaced call "jQuery.sap.getModulePath"',
				'trace: 28: Replaced call "jQuery.sap.getModulePath"',
				'trace: 29: Replaced call "jQuery.sap.getModulePath"',
				'trace: 32: Replaced call "jQuery.sap.getResourcePath"',
				'trace: 34: Replaced call "jQuery.sap.getResourcePath"',
				'trace: 35: Replaced call "jQuery.sap.getResourcePath"',
				'trace: 33: Replaced call "jQuery.sap.getResourcePath"',
				'trace: 39: Replaced call "jQuery.sap.getResourcePath"',
				'trace: 40: Replaced call "jQuery.sap.getResourcePath"',
				'trace: 41: Replaced call "jQuery.sap.getResourcePath"',
				'trace: 42: Replaced call "jQuery.sap.getResourcePath"',
				'trace: 43: Replaced call "jQuery.sap.getResourcePath"',
				'trace: 44: Replaced call "jQuery.sap.getResourcePath"',
				'trace: 45: Replaced call "jQuery.sap.getResourcePath"',
				'trace: 48: Replaced call "jQuery.sap.getResourcePath"',
				'trace: 49: Replaced call "jQuery.sap.getResourcePath"',
				'trace: 50: Replaced call "jQuery.sap.getResourcePath"',
				'trace: 51: Replaced call "jQuery.sap.getResourcePath"',
				'trace: 52: Replaced call "jQuery.sap.getResourcePath"',
				'trace: 53: Replaced call "jQuery.sap.getResourcePath"',
			]);
		});

		it("ModuleSystem", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "ModuleSystem.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "ModuleSystem.config.json")
			);
			const module = new CustomFileInfo(rootDir + "ModuleSystem.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 25: Replace global call with "sap.ui.loader.config"',
				'trace: 25: Found call to replace "jQuery.sap.registerResourcePath"',
				'trace: 26: Replace global call with "sap.ui.loader.config"',
				'trace: 26: Found call to replace "jQuery.sap.registerResourcePath"',
				'trace: 27: Replace global call with "sap.ui.loader.config"',
				'trace: 27: Found call to replace "jQuery.sap.registerResourcePath"',
				'trace: 29: Replace global call with "sap.ui.loader.config"',
				'trace: 29: Found call to replace "jQuery.sap.registerModulePath"',
				'trace: 30: Replace global call with "sap.ui.loader.config"',
				'trace: 30: Found call to replace "jQuery.sap.registerModulePath"',
				'trace: 31: Replace global call with "sap.ui.loader.config"',
				'trace: 31: Found call to replace "jQuery.sap.registerModulePath"',
				'trace: 32: Replace global call with "sap.ui.loader.config"',
				'trace: 32: Found call to replace "jQuery.sap.registerModulePath"',
				'trace: 33: Replace global call with "sap.ui.loader.config"',
				'trace: 33: Found call to replace "jQuery.sap.registerModulePath"',
				'trace: 25: Replaced call "jQuery.sap.registerResourcePath"',
				'trace: 26: Replaced call "jQuery.sap.registerResourcePath"',
				'trace: 27: Replaced call "jQuery.sap.registerResourcePath"',
				'trace: 29: Replaced call "jQuery.sap.registerModulePath"',
				'trace: 30: Replaced call "jQuery.sap.registerModulePath"',
				'trace: 31: Replaced call "jQuery.sap.registerModulePath"',
				'trace: 32: Replaced call "jQuery.sap.registerModulePath"',
				'trace: 33: Replaced call "jQuery.sap.registerModulePath"',
			]);
		});

		it("isPlainObject", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "isPlainObject.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "isPlainObject.config.json")
			);
			const module = new CustomFileInfo(rootDir + "isPlainObject.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[
					'trace: 25: Replace global call with "sap.base.util.isPlainObject"',
					'trace: 25: Found call to replace "jQuery.isPlainObject"',
					'trace: 22: Replace global call with "sap.base.util.isPlainObject"',
					'trace: 22: Found call to replace "jQuery.isPlainObject"',
					'trace: 25: Replaced call "jQuery.isPlainObject"',
					'trace: 22: Replaced call "jQuery.isPlainObject"',
					'trace: 7: Add dependency "sap/base/util/isPlainObject" named "isPlainObject"',
					'trace: 7: Remove dependency "sap/ui/thirdparty/jquery"',
				],
				"trace",
				"latest",
				[
					{
						fileName: "./test/replaceGlobals/isPlainObject.js",
						location: {
							endColumn: 48,
							endLine: 25,
							startColumn: 28,
							startLine: 25,
						},
						message: "found deprecated global",
						taskName: "replaceGlobals",
					},
					{
						fileName: "./test/replaceGlobals/isPlainObject.js",
						location: {
							endColumn: 36,
							endLine: 22,
							startColumn: 16,
							startLine: 22,
						},
						message: "found deprecated global",
						taskName: "replaceGlobals",
					},
				]
			);
		});

		it("isPlainObject with other jQuery", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "isPlainObject2.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "isPlainObject2.config.json")
			);
			const module = new CustomFileInfo(rootDir + "isPlainObject2.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 25: Replace global call with "sap.base.util.isPlainObject"',
				'trace: 25: Found call to replace "jQuery.isPlainObject"',
				'trace: 28: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 28: Found call to replace "jQuery.each"',
				'trace: 22: Replace global call with "sap.base.util.isPlainObject"',
				'trace: 22: Found call to replace "jQuery.isPlainObject"',
				'trace: 25: Replaced call "jQuery.isPlainObject"',
				'trace: 28: Replaced call "jQuery.each"',
				'trace: 22: Replaced call "jQuery.isPlainObject"',
				'trace: 7: Add dependency "sap/base/util/isPlainObject" named "isPlainObject"',
			]);
		});

		it("sap.ui.define is after another call", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "laterSapDefine.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "laterSapDefine.config.json")
			);
			const module = new CustomFileInfo(rootDir + "laterSapDefine.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 28: Replace global call with "sap.base.Log"',
				'trace: 28: Found call to replace "jQuery.sap.log.Level.FATAL"',
				'trace: 28: Replace global call with "sap.base.Log"',
				'trace: 28: Found call to replace "jQuery.sap.log.Level.ERROR"',
				'trace: 32: Replace global call with "sap.base.Log"',
				'trace: 32: Found call to replace "jQuery.sap.log.LogLevel.FATAL"',
				'trace: 32: Replace global call with "sap.base.Log"',
				'trace: 32: Found call to replace "jQuery.sap.log.LogLevel.ERROR"',
				'trace: 28: Replaced call "jQuery.sap.log.Level"',
				'trace: 28: Replaced call "jQuery.sap.log.Level"',
				'trace: 32: Replaced call "jQuery.sap.log.LogLevel"',
				'trace: 32: Replaced call "jQuery.sap.log.LogLevel"',
				'trace: 12: Add dependency "sap/base/Log" named "Log"',
				'trace: 12: Remove dependency "jquery.sap.global"',
			]);
		});

		it("should replace jquery.extend", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jqueryExtend.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "jqueryExtend.config.json")
			);
			const module = new CustomFileInfo(rootDir + "jqueryExtend.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 22: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 22: Found call to replace "jQuery.extend"',
				'trace: 23: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 23: Found call to replace "jQuery.extend"',
				'trace: 24: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 24: Found call to replace "jQuery.extend"',
				'trace: 25: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 25: Found call to replace "jQuery.extend"',
				'trace: 26: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 26: Found call to replace "jQuery.extend"',
				'trace: 27: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 27: Found call to replace "jQuery.extend"',
				'trace: 22: Replaced call "jQuery.extend"',
				'trace: 23: Replaced call "jQuery.extend"',
				'trace: 24: Replaced call "jQuery.extend"',
				'trace: 25: Replaced call "jQuery.extend"',
				'trace: 26: Replaced call "jQuery.extend"',
				'trace: 27: Replaced call "jQuery.extend"',
			]);
		});

		it("should replace jquery.extend SkipImport", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jqueryExtendSkipImport.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "jqueryExtendSkipImport.config.json")
			);
			const module = new CustomFileInfo(
				rootDir + "jqueryExtendSkipImport.js"
			);
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[
					'trace: 22: Replace global call with "sap.ui.thirdparty.jquery"',
					'trace: 22: Found call to replace "jQuery.extend"',
					'trace: 22: Replaced call "jQuery.extend"',
				],
				"trace",
				"latest",
				[
					{
						fileName:
							"./test/replaceGlobals/jqueryExtendSkipImport.js",
						location: {
							endColumn: 25,
							endLine: 22,
							startColumn: 12,
							startLine: 22,
						},
						message: "found deprecated global",
						taskName: "replaceGlobals",
					},
				]
			);
		});

		it("should replace and add dependency for extend", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "extend.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "extend.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "extend.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 26: Replace global call with "sap.base.util.merge"',
				'trace: 26: Found call to replace "jQuery.sap.extend"',
				'trace: 28: Replace global call with "sap.base.util.merge"',
				'trace: 28: Found call to replace "jQuery.sap.extend"',
				'trace: 26: Replaced call "jQuery.sap.extend"',
				'trace: 28: Replaced call "jQuery.sap.extend"',
				'trace: 7: Add dependency "sap/base/util/merge" named "merge"',
			]);
		});

		it("should replace and add dependency for sap extend", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "sapextend.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "sapextend.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "sapextend.js");
			analyseMigrateAndTest(
				module,
				false,
				expectedContent,
				config,
				done,
				[
					"trace: 26: Deprecated call of type ModuleFunction",
					'trace: 26: Found call to replace "jQuery.sap.extend"',
					"trace: 28: Deprecated call of type ModuleFunction",
					'trace: 28: Found call to replace "jQuery.sap.extend"',
					"debug: 26: ignored element: jQuery.sap.extend",
					"error: 26: Error: replacement ignored, no replacer configured for jQuery.sap.extend",
					"debug: 28: ignored element: jQuery.sap.extend",
					"error: 28: Error: replacement ignored, no replacer configured for jQuery.sap.extend",
				]
			);
		});

		it("should replace and leave dependency for assign", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "assign.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "assign.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "assign.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 26: Replace global call with "sap.base.util.merge"',
				'trace: 26: Found call to replace "jQuery.sap.extend"',
				'trace: 28: Replace global call with "sap.base.util.merge"',
				'trace: 28: Found call to replace "jQuery.sap.extend"',
				'trace: 29: Replace global call with "sap.base.util.merge"',
				'trace: 29: Found call to replace "jQuery.sap.extend"',
				'trace: 30: Replace global call with "sap.base.util.merge"',
				'trace: 30: Found call to replace "jQuery.sap.extend"',
				'trace: 26: Replaced call "jQuery.sap.extend"',
				'trace: 28: Replaced call "jQuery.sap.extend"',
				'trace: 29: Replaced call "jQuery.sap.extend"',
				'trace: 30: Replaced call "jQuery.sap.extend"',
			]);
		});

		it("should replace only matching version replacement", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "versionReplacement.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(
					rootDir + "versionReplacement.config.json",
					"utf8"
				)
			);
			const module = new CustomFileInfo(
				rootDir + "versionReplacement.js"
			);
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[
					"debug: 23: ignored element: jQuery.sap.uid",
					"error: 23: Error: replacement ignored, no replacer configured for jQuery.sap.uid",
				],
				"debug",
				"1.55.0"
			);
		});

		it("should replace and leave dependency for assign and add dependency for merge extendAndAssign", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "extendAndAssign.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "extendAndAssign.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "extendAndAssign.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 26: Replace global call with "sap.base.util.merge"',
				'trace: 26: Found call to replace "jQuery.sap.extend"',
				'trace: 28: Replace global call with "sap.base.util.merge"',
				'trace: 28: Found call to replace "jQuery.sap.extend"',
				'trace: 34: Replace global call with "sap.base.util.merge"',
				'trace: 34: Found call to replace "jQuery.sap.extend"',
				'trace: 36: Replace global call with "sap.base.util.merge"',
				'trace: 36: Found call to replace "jQuery.sap.extend"',
				'trace: 37: Replace global call with "sap.base.util.merge"',
				'trace: 37: Found call to replace "jQuery.sap.extend"',
				'trace: 38: Replace global call with "sap.base.util.merge"',
				'trace: 38: Found call to replace "jQuery.sap.extend"',
				'trace: 26: Replaced call "jQuery.sap.extend"',
				'trace: 28: Replaced call "jQuery.sap.extend"',
				'trace: 34: Replaced call "jQuery.sap.extend"',
				'trace: 36: Replaced call "jQuery.sap.extend"',
				'trace: 37: Replaced call "jQuery.sap.extend"',
				'trace: 38: Replaced call "jQuery.sap.extend"',
				'trace: 7: Add dependency "sap/base/util/merge" named "merge"',
			]);
		});

		it("should replace jQuery.trim()", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jqueryTrim.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "jqueryTrim.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "jqueryTrim.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[
					"trace: 22: Deprecated call of type jQueryTrim",
					'trace: 22: Found call to replace "jQuery.trim"',
					"trace: 23: Deprecated call of type jQueryTrim",
					'trace: 23: Found call to replace "jQuery.trim"',
					'trace: 22: Replaced call "jQuery.trim"',
					'trace: 23: Replaced call "jQuery.trim"',
					'trace: 7: Remove dependency "sap/ui/thirdparty/jquery"',
				],
				"trace",
				"latest",
				[
					{
						fileName: "./test/replaceGlobals/jqueryTrim.js",
						location: {
							endColumn: 32,
							endLine: 22,
							startColumn: 21,
							startLine: 22,
						},
						message: "found deprecated global",
						taskName: "replaceGlobals",
					},
					{
						fileName: "./test/replaceGlobals/jqueryTrim.js",
						location: {
							endColumn: 34,
							endLine: 23,
							startColumn: 23,
							startLine: 23,
						},
						message: "found deprecated global",
						taskName: "replaceGlobals",
					},
				]
			);
		});

		it("should replace jQuery.contains", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jQueryContains.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "jQueryContains.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "jQueryContains.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				"trace: 24: Deprecated call of type jQueryContains",
				'trace: 24: Found call to replace "jQuery.contains"',
				'trace: 24: Replaced call "jQuery.contains"',
				'trace: 7: Remove dependency "sap/ui/thirdparty/jquery"',
			]);
		});

		it("should replace spy and stub calls from sinon", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "testSpies.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "testSpies.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "testSpies.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 22: Replace global call with "sap.base.Log"',
				'trace: 22: Found call to replace "jQuery.sap.log.debug"',
				'trace: 25: Replace global call with "sap.base.Log"',
				'trace: 25: Found call to replace "jQuery.sap.log"',
				'trace: 22: Replaced call "jQuery.sap.log.debug"',
				'trace: 25: Replaced call "jQuery.sap.log"',
				'trace: 7: Add dependency "sap/base/Log" named "Log"',
				'trace: 7: Remove dependency "jquery.sap.global"',
			]);
		});

		it("should replace variable assignments", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "variableAssignment.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(
					rootDir + "variableAssignment.config.json",
					"utf8"
				)
			);
			const module = new CustomFileInfo(
				rootDir + "variableAssignment.js"
			);
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 7: Replace global call with "sap.base.Log"',
				'trace: 7: Found call to replace "jQuery.sap.log"',
				'trace: 7: Replaced call "jQuery.sap.log"',
				'trace: 3: Add dependency "sap/base/Log" named "Log"',
			]);
		});

		it("should replace jQuery.extend properly", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "jqueryExtendVars.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(
					rootDir + "jqueryExtendVars.config.json",
					"utf8"
				)
			);
			const module = new CustomFileInfo(rootDir + "jqueryExtendVars.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 24: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 24: Found call to replace "jQuery.extend"',
				'trace: 24: Replaced call "jQuery.extend"',
				'trace: 7: Remove dependency "sap/ui/thirdparty/jquery"',
			]);
		});

		it("extendImport", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "extendImport.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "extendImport.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "extendImport.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 2: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 2: Found call to replace "jQuery.extend"',
				'trace: 3: Replace global call with "sap.ui.thirdparty.jquery"',
				'trace: 3: Found call to replace "jQuery.extend"',
				'trace: 2: Replaced call "jQuery.extend"',
				'trace: 3: Replaced call "jQuery.extend"',
				'trace: 1: Add dependency "sap/ui/thirdparty/jquery" named "jQuery0"',
			]);
		});

		it("invalidDefine", done => {
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
				["warning: invalid sap.ui.define call without factory"],
				"trace",
				"latest",
				[]
			);
		});

		it("leave with comment", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "leave.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "leave.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "leave.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[
					'trace: 23: Replace global call with "LEAVE"',
					'trace: 23: Found call to replace "jQuery.sap.history"',
					"debug: 23: ignored element: jQuery.sap.history",
					"error: 23: Error: Ignore",
				],
				"trace",
				"latest",
				[]
			);
		});

		it("multiversion latest", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "multiversion.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "multiversion.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "multiversion.js");
			analyseMigrateAndTest(module, true, expectedContent, config, done, [
				'trace: 26: Replace global call with "sap.base.util.merge"',
				'trace: 26: Found call to replace "jQuery.sap.extend"',
				'trace: 28: Replace global call with "sap.base.util.merge"',
				'trace: 28: Found call to replace "jQuery.sap.extend"',
				'trace: 29: Replace global call with "sap.base.util.merge"',
				'trace: 29: Found call to replace "jQuery.sap.extend"',
				'trace: 30: Replace global call with "sap.base.util.merge"',
				'trace: 30: Found call to replace "jQuery.sap.extend"',
				'trace: 26: Replaced call "jQuery.sap.extend"',
				'trace: 28: Replaced call "jQuery.sap.extend"',
				'trace: 29: Replaced call "jQuery.sap.extend"',
				'trace: 30: Replaced call "jQuery.sap.extend"',
			]);
		});

		it("multiversion version 1.60.0", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "multiversion.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "multiversion.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "multiversion.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[
					'trace: 26: Replace global call with "sap.base.util.merge"',
					'trace: 26: Found call to replace "jQuery.sap.extend"',
					'trace: 28: Replace global call with "sap.base.util.merge"',
					'trace: 28: Found call to replace "jQuery.sap.extend"',
					'trace: 29: Replace global call with "sap.base.util.merge"',
					'trace: 29: Found call to replace "jQuery.sap.extend"',
					'trace: 30: Replace global call with "sap.base.util.merge"',
					'trace: 30: Found call to replace "jQuery.sap.extend"',
					'trace: 26: Replaced call "jQuery.sap.extend"',
					'trace: 28: Replaced call "jQuery.sap.extend"',
					'trace: 29: Replaced call "jQuery.sap.extend"',
					'trace: 30: Replaced call "jQuery.sap.extend"',
				],
				"trace",
				"1.60.0"
			);
		});

		it("multiversion version 1.58.0", done => {
			const expectedContent = fs.readFileSync(
				rootDir + "multiversion.1.58.0.expected.js",
				"utf8"
			);
			const config = JSON.parse(
				fs.readFileSync(rootDir + "multiversion.config.json", "utf8")
			);
			const module = new CustomFileInfo(rootDir + "multiversion.js");
			analyseMigrateAndTest(
				module,
				true,
				expectedContent,
				config,
				done,
				[
					'trace: 26: Replace global call with "sap.ui.thirdparty.jquery"',
					'trace: 26: Found call to replace "jQuery.sap.extend"',
					'trace: 28: Replace global call with "sap.ui.thirdparty.jquery"',
					'trace: 28: Found call to replace "jQuery.sap.extend"',
					'trace: 29: Replace global call with "sap.ui.thirdparty.jquery"',
					'trace: 29: Found call to replace "jQuery.sap.extend"',
					'trace: 30: Replace global call with "sap.ui.thirdparty.jquery"',
					'trace: 30: Found call to replace "jQuery.sap.extend"',
					'trace: 26: Replaced call "jQuery.sap.extend"',
					'trace: 28: Replaced call "jQuery.sap.extend"',
					'trace: 29: Replaced call "jQuery.sap.extend"',
					'trace: 30: Replaced call "jQuery.sap.extend"',
					'trace: 7: Add dependency "sap/ui/thirdparty/jquery" named "jQuery0"',
				],
				"trace",
				"1.58.0"
			);
		});
	});
});
