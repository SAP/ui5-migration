import * as NamespaceUtils from "../../src/util/NamespaceUtils";

const recast = require("recast");
const assert = require("assert");

describe("NamespaceUtils", () => {
	it("Should get the common part", () => {
		assert.equal(
			NamespaceUtils.getCommonPart("a.b.c.d", "a.b.x.y"),
			"a.b",
			"a.b. common part"
		);

		assert.equal(
			NamespaceUtils.getCommonPart("f.b.c.d", "a.b.x.y"),
			"",
			"no common part"
		);

		assert.equal(
			NamespaceUtils.getCommonPart("f.b.c.d", "b.c.d"),
			"",
			"no common part"
		);

		assert.equal(
			NamespaceUtils.getCommonPart("a.be.c.d", "a.b.x.y"),
			"a",
			"a. common part"
		);
	});

	it("findNamespaceUsage", () => {
		const src = `sap.ui.define(["a/b/c", "d/x/f", "./x"], function(c, f, x){
			a.g.blah = "fu";
			return null;
		});`;

		const ast = recast.parse(src).program;

		assert.ok(
			NamespaceUtils.findNamespaceUsage(ast, "a.g.h"),
			"namespace found"
		);
	});

	it("findNamespaceUsage fail", () => {
		const src = `sap.ui.define(["a/b/c", "d/x/f", "./x"], function(c, f, x){
			a.g.blah = "fu";
			return null;
		});`;

		const ast = recast.parse(src).program;

		assert.ok(
			NamespaceUtils.findNamespaceUsage(ast, "a.z.h"),
			"namespace found"
		);
	});
});
