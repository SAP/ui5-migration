import {AstStringOptimizeStrategy} from "../../../src/util/whitespace/AstStringOptimizeStrategy";
import {CustomReporter} from "../testUtils";


const assert = require("assert");
const fs = require("fs");
const rootDir = "./test/util/whitespace/astresources/";

describe("AstStringOptimizeStrategy", function() {
	it("Should optimize batch", async function() {
		const source = fs.readFileSync(rootDir + "batch.source.js", "UTF-8");
		const modified =
			fs.readFileSync(rootDir + "batch.modified.js", "UTF-8");
		const expected =
			fs.readFileSync(rootDir + "batch.expected.js", "UTF-8");
		const astStringOptimizeStrategy = new AstStringOptimizeStrategy();
		const sOptimized =
			await astStringOptimizeStrategy.optimizeString(source, modified);
		assert.deepStrictEqual(
			sOptimized, expected,
			"Target version and given version range match");
	});

	it("Should optimize list", async function() {
		const source = fs.readFileSync(rootDir + "list.source.js", "UTF-8");
		const modified = fs.readFileSync(rootDir + "list.modified.js", "UTF-8");
		const expected = fs.readFileSync(rootDir + "list.expected.js", "UTF-8");
		const astStringOptimizeStrategy = new AstStringOptimizeStrategy();
		const sOptimized =
			await astStringOptimizeStrategy.optimizeString(source, modified);
		assert.deepStrictEqual(
			sOptimized, expected,
			"Target version and given version range match");
	});

	it("Should optimize actions", async function() {
		const source = fs.readFileSync(rootDir + "actions.source.js", "UTF-8");
		const modified =
			fs.readFileSync(rootDir + "actions.modified.js", "UTF-8");
		const expected =
			fs.readFileSync(rootDir + "actions.expected.js", "UTF-8");
		const reports = [];
		const astStringOptimizeStrategy =
			new AstStringOptimizeStrategy(new CustomReporter(reports, "trace"));
		const sOptimized =
			await astStringOptimizeStrategy.optimizeString(source, modified);
		assert.deepStrictEqual(
			reports, [ "trace: Performing AstStringOptimizeStrategy" ],
			"Target version and given version range match");
		assert.deepStrictEqual(
			sOptimized, expected,
			"Target version and given version range match");
	});

	it("Should optimize abap", async function() {
		const source = fs.readFileSync(rootDir + "abap.source.js", "UTF-8");
		const modified = fs.readFileSync(rootDir + "abap.modified.js", "UTF-8");
		const expected = fs.readFileSync(rootDir + "abap.expected.js", "UTF-8");
		const reports = [];
		const astStringOptimizeStrategy =
			new AstStringOptimizeStrategy(new CustomReporter(reports, "trace"));
		const sOptimized =
			await astStringOptimizeStrategy.optimizeString(source, modified);
		assert.deepStrictEqual(
			sOptimized, expected,
			"Target version and given version range match");
		assert.deepStrictEqual(
			reports,
			[
				"trace: Performing AstStringOptimizeStrategy",
				"trace: AST: whitespace diff for preceding element",
				"trace: AST: remove '[ ]'",
				"trace: AST: add '[\\r][\\n][ ][ ][ ][ ]'",
				"trace: AST: index: 114",
				"trace: AST: whitespace diff for succeeding element",
				"trace: AST: remove '[\\r][\\n]'", "trace: AST: add '[]'",
				"trace: AST: index: 111",
				"trace: AST: whitespace diff for succeeding element",
				"trace: AST: remove '[]'", "trace: AST: add '[\\r][\\n]'",
				"trace: AST: index: 141"
			],
			"Target version and given version range match");
	});

	it("Should optimize custom", async function() {
		const source = fs.readFileSync(rootDir + "custom.source.js", "UTF-8");
		const modified =
			fs.readFileSync(rootDir + "custom.modified.js", "UTF-8");
		const expected =
			fs.readFileSync(rootDir + "custom.expected.js", "UTF-8");
		const reports = [];
		const astStringOptimizeStrategy =
			new AstStringOptimizeStrategy(new CustomReporter(reports, "trace"));
		const sOptimized =
			await astStringOptimizeStrategy.optimizeString(source, modified);
		assert.deepStrictEqual(
			sOptimized, expected,
			"Target version and given version range match");
		assert.deepStrictEqual(
			reports,
			[
				"trace: Performing AstStringOptimizeStrategy",
				"trace: AST: whitespace diff for preceding element",
				"trace: AST: remove '[\\r][\\n][ ][ ][ ][ ]'",
				"trace: AST: add '[\\r][\\n][\\t]'", "trace: AST: index: 581",
				"trace: AST: whitespace diff for preceding element",
				"trace: AST: remove '[\\r][\\n][ ]'", "trace: AST: add '[]'",
				"trace: AST: index: 624",
				"trace: AST: whitespace diff for preceding element",
				"trace: AST: remove '[\\r][\\n][\\t]'", "trace: AST: add '[ ]'",
				"trace: AST: index: 858",
				"trace: AST: whitespace diff for succeeding element",
				"trace: AST: remove '[\\r][\\n]'", "trace: AST: add '[]'",
				"trace: AST: index: 863"
			],
			"Target version and given version range match");
	});


	it("Should optimize breaking", async function() {
		const source = fs.readFileSync(rootDir + "breaking.source.js", "UTF-8");
		const modified =
			fs.readFileSync(rootDir + "breaking.modified.js", "UTF-8");
		const expected =
			fs.readFileSync(rootDir + "breaking.expected.js", "UTF-8");
		const reports = [];
		const astStringOptimizeStrategy =
			new AstStringOptimizeStrategy(new CustomReporter(reports, "trace"));
		const sOptimized =
			await astStringOptimizeStrategy.optimizeString(source, modified);
		assert.deepStrictEqual(
			sOptimized, expected,
			"Target version and given version range match");
		assert.deepStrictEqual(
			reports, [ "trace: Performing AstStringOptimizeStrategy" ],
			"Target version and given version range match");
	});
});