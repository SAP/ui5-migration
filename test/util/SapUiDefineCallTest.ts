import * as ASTUtils from "../../src/util/ASTUtils";
import {SapUiDefineCall} from "../../src/util/SapUiDefineCall";

const recast = require("recast");
const assert = require("assert");

describe("SapUiDefineCall", () => {
	it("create SapUiDefineCall with relative imports", () => {
		const src = `sap.ui.define(["a/b/c", "d/x/f", "./x"], function(c, f, x){
			return null;
		});`;

		const ast = recast.parse(src).program;

		const defineCalls = ASTUtils.findCalls(
			ast,
			SapUiDefineCall.isValidRootPath
		);

		assert.equal(defineCalls.length, 1);

		const sapUiDefineCall = new SapUiDefineCall(
			defineCalls[0].value,
			"a/b/mymodule"
		);

		assert.deepEqual(sapUiDefineCall.getAbsoluteDependencyPaths(), [
			"a/b/c",
			"d/x/f",
			"a/b/x",
		]);
		assert.equal(
			sapUiDefineCall.exportToGlobal,
			false,
			"should not have a global export"
		);
	});

	it("should check exportToGlobal flag", () => {
		const src = `sap.ui.define(["a/b/c", "d/x/f", "./x"], function(c, f, x){
			return null;
		}, true);`;

		const ast = recast.parse(src).program;

		const defineCalls = ASTUtils.findCalls(
			ast,
			SapUiDefineCall.isValidRootPath
		);

		assert.equal(defineCalls.length, 1);

		const sapUiDefineCall = new SapUiDefineCall(
			defineCalls[0].value,
			"a/b/mymodule"
		);

		assert.equal(
			sapUiDefineCall.exportToGlobal,
			true,
			"should have a global export"
		);
	});
});
