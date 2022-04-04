import {
	AnalyzeCharacter,
	CodeStyleAnalyzer,
} from "../../src/util/CodeStyleAnalyzer";

const assert = require("assert");

describe("CodeStyleAnalyzerTest", () => {
	it("analyze strings ui5 style", () => {
		const source =
			'sap.ui.require(["a", "b", "c"], function(a, b, c) {\n\treturn a(b(b(c())));\n});';
		const analyzer = new CodeStyleAnalyzer(source);
		assert.strictEqual(
			analyzer.getMostCommon(AnalyzeCharacter.INDENT),
			true,
			"should be tab"
		);
		assert.strictEqual(
			analyzer.getMostCommon(AnalyzeCharacter.NEWLINE),
			"N",
			"should be N"
		);
	});

	it("analyze strings runtime style", () => {
		const source =
			'sap.ui.require(["a", "b", "c"], function(a, b, c) {\r\n\treturn a(b(b(c())));\r\n});';
		const analyzer = new CodeStyleAnalyzer(source);
		assert.strictEqual(
			analyzer.getMostCommon(AnalyzeCharacter.INDENT),
			true,
			"should be tab"
		);
		assert.strictEqual(
			analyzer.getMostCommon(AnalyzeCharacter.NEWLINE),
			"RN",
			"should be N"
		);
	});

	it("analyze strings runtime style 2", () => {
		const source =
			'sap.ui.require([\n\t"a",\n\t"b",\n\t"c",\n\t"d"\n], function(a, b, c, d) {\n\treturn a(b(b(c(d()))));\n});';
		const analyzer = new CodeStyleAnalyzer(source);
		assert.strictEqual(
			analyzer.getMostCommon(AnalyzeCharacter.INDENT),
			true,
			"should be tab"
		);
		assert.strictEqual(
			analyzer.getMostCommon(AnalyzeCharacter.NEWLINE),
			"N",
			"should be N"
		);
	});

	it("analyze strings runtime style 3", () => {
		const source =
			'sap.ui.require([\r\n\t"a",\r\n\t"b",\r\n\t"c",\r\n\t"d"\r\n], function(a, b, c, d) {\r\n\treturn a(b(b(c(d()))));\r\n});';
		const analyzer = new CodeStyleAnalyzer(source);
		assert.strictEqual(
			analyzer.getMostCommon(AnalyzeCharacter.INDENT),
			true,
			"should be tab"
		);
		assert.strictEqual(
			analyzer.getMostCommon(AnalyzeCharacter.NEWLINE),
			"RN",
			"should be RN"
		);
	});

	it("analyze strings runtime style spaces 2 EOL RN", () => {
		const source =
			'sap.ui.require([\r\n  "a",\r\n  "b",\r\n  "c",\r\n  "d"\r\n], function(a, b, c, d) {\r\n  return a(b(b(c(d()))));\r\n});';
		const analyzer = new CodeStyleAnalyzer(source);
		assert.strictEqual(
			analyzer.getMostCommon(AnalyzeCharacter.INDENT),
			2,
			"should be 2 spaces"
		);
		assert.strictEqual(
			analyzer.getMostCommon(AnalyzeCharacter.NEWLINE),
			"RN",
			"should be RN"
		);
	});

	it("analyze strings runtime style spaces 2 EOL N", () => {
		const source =
			'sap.ui.require([\r\n  "a",\n  "b",\n  "c",\n  "d"\n], ' +
			"function(a, b, c, d) {\n  return {\n    a: 1;\n    b: 1;\n    c: 1;\n    d: 1;\n    e: 1;\n    f: 1;};\n});";
		const analyzer = new CodeStyleAnalyzer(source);
		assert.strictEqual(
			analyzer.getMostCommon(AnalyzeCharacter.INDENT),
			2,
			"should be 2 spaces"
		);
		assert.strictEqual(
			analyzer.getMostCommon(AnalyzeCharacter.NEWLINE),
			"N",
			"should be RN"
		);
	});

	it("analyze strings runtime style spaces 4 EOL N", () => {
		const source =
			'sap.ui.require([\n    "a",\n    "b",\n    "c",\n    "d"\n], function(a, b, c, d) {\n    return a(b(b(c(d()))));\n});';
		const analyzer = new CodeStyleAnalyzer(source);
		assert.strictEqual(
			analyzer.getMostCommon(AnalyzeCharacter.INDENT),
			4,
			"should be 4 spaces"
		);
		assert.strictEqual(
			analyzer.getMostCommon(AnalyzeCharacter.NEWLINE),
			"N",
			"should be N"
		);
	});
});
