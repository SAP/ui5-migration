import {migrateString} from "../src";
import {ReportLevel} from "../src/reporter/Reporter";

const assert = require("assert");

/*
TODO mock access to json file for apply-amd-syntax
describe("index migration string happy path", function() {
	it("migrateString should migrate an empty string", function() {
		return migrateString(undefined, "").then(function(sResult) {
			const expected = "sap.ui.define([], function() {});";
			assert.equal(
				sResult.output, expected,
				"should be migrated to empty module definition");
		});
	});

	it("migrateString should jQqery calls", function() {
		return migrateString(undefined, `sap.ui.define([], function() {
				var asd = jQuery.sap.uid();
				jQuery.sap.log.info(asd);
			});`)
			.then(function(sResult) {
				const expected =
					`sap.ui.define(["sap/base/util/uid", "sap/base/Log"],
function(uid, Log) { var asd = uid(); Log.info(asd);
			});`;
				assert.equal(
					sResult.output, expected,
					"should be migrated to empty module definition");
			})
			.catch(function(e) {
				assert.ok(e);
			});
	});
});
*/

describe("index migration string sad path", () => {
	it("migrateString should not migrate invalid values", () => {
		return migrateString(undefined, undefined).catch(sError => {
			assert.equal(sError.message, "input must be a string");
		});
	});
});

describe("index migration json result", () => {
	/*
	TODO mock access to json file for apply-amd-syntax
	it("migrateString should jQqery calls", function() {
		return Promise
			.resolve(migrateString(undefined, `sap.ui.define([], function() {
				var asd = jQuery.sap.uid();
				jQuery.sap.log.info(asd);
			});`))
			.then(function(oResult) {
				const expected =
					`sap.ui.define(["sap/base/util/uid", "sap/base/Log"],
	function(uid, Log) { var asd = uid(); Log.info(asd);
			});`;
				assert.equal(
					oResult.output, expected,
					"should be migrated to empty module definition");
				assert.equal(
					oResult.log.length, 1,
					"should be migrated to empty module definition");

				assert.equal(
					oResult.log[0].taskName, "replace-globals",
					"should be migrated to empty module definition");
				assert.ok(Array.isArray(oResult.log[0].replacements));
				assert.equal(
					oResult.log[0].replacements.length, 2,
					"should be migrated to empty module definition");
			});
	});
	*/

	/*
	TODO mock access to json file for apply-amd-syntax
	it("migrateString should jQqery calls with tasks",
	   function() {
		   return migrateString([ "replace-globals", "apply-amd-syntax" ], `
				jQuery.sap.uid();
				jQuery.sap.log.info(asd);
			`).then(function(oResult) {
			   const expected =
				   `sap.ui.define(["sap/base/util/uid", "sap/base/Log"],
function(uid, Log) { uid(); Log.info(asd);
});`;
			   assert.equal(
				   oResult.output, expected,
				   "should be migrated to empty module definition");
			   assert.equal(
				   oResult.log.length, 1,
				   "should be migrated to empty module definition");

			   assert.equal(
				   oResult.log[0].taskName, "replace-globals",
				   "should be migrated to empty module definition");
			   assert.ok(Array.isArray(oResult.log[0].replacements));
			   assert.equal(
				   oResult.log[0].replacements.length, 2,
				   "should be migrated to empty module definition");
		   });
	   });
	   */

	it("migrateString should jQuery calls with tasks only", function () {
		// increase test timeout since this test is long running
		this.timeout(10000);
		return migrateString(
			["replace-globals"],
			`sap.ui.define([], function(){
				jQuery.sap.uid();
				jQuery.sap.log.info(asd);
			});`,
			ReportLevel.TRACE
		).then(oResult => {
			const expected = `sap.ui.define(["sap/base/util/uid", "sap/base/Log"], function(uid, Log) {
				uid();
				Log.info(asd);
			});`;
			assert.equal(
				oResult.output,
				expected,
				"should be migrated to empty module definition"
			);
			assert.equal(
				oResult.log.length,
				1,
				"should be migrated to empty module definition"
			);

			assert.equal(
				oResult.log[0].taskName,
				"replace-globals",
				"should be migrated to empty module definition"
			);
			assert.ok(Array.isArray(oResult.log[0].replacements));
			assert.deepEqual(
				oResult.log[0].replacements,
				[
					{
						location: {
							end: {column: 30, line: 2},
							start: {column: 16, line: 2},
						},
						modification:
							'Replace global call with "sap.base.util.uid"',
					},
					{
						location: {
							end: {column: 30, line: 2},
							start: {column: 16, line: 2},
						},
						modification: 'Found call to replace "jQuery.sap.uid"',
					},
					{
						location: {
							end: {column: 35, line: 3},
							start: {column: 16, line: 3},
						},
						modification: 'Replace global call with "sap.base.Log"',
					},
					{
						location: {
							end: {column: 35, line: 3},
							start: {column: 16, line: 3},
						},
						modification:
							'Found call to replace "jQuery.sap.log.info"',
					},
					{
						location: {
							end: {column: 30, line: 2},
							start: {column: 16, line: 2},
						},
						modification: 'Replaced call "jQuery.sap.uid"',
					},
					{
						location: {
							end: {column: 35, line: 3},
							start: {column: 16, line: 3},
						},
						modification: 'Replaced call "jQuery.sap.log.info"',
					},
					{
						location: {
							end: {column: 13, line: 4},
							start: {column: 18, line: 1},
						},
						modification:
							'Add dependency "sap/base/util/uid" named "uid"',
					},
					{
						location: {
							end: {column: 13, line: 4},
							start: {column: 18, line: 1},
						},
						modification:
							'Add dependency "sap/base/Log" named "Log"',
					},
				],
				"should be migrated to empty module definition"
			);
		});
	});
});
