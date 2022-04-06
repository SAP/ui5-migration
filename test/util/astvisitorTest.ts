import {ASTVisitor} from "../../src/util/ASTVisitor";

const assert = require("assert");
const recast = require("recast");
import {genRandomJS} from "./ASTVisitor/genRandomJS";

/**
 * Provides an ES6 Proxy handler object which counts every function call
 *
 * @class ProxyVisitsCounter
 */
class ProxyVisitsCounter {
	private counts: {[index: string]: number};
	constructor() {
		this.counts = {};
	}

	has(target, key) {
		return true; // we have everything
	}

	get(target, key, receiver) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		if (key in target) {
			return target[key];
		} else {
			return function (path) {
				if (key in that.counts) {
					that.counts[key]++;
				} else {
					that.counts[key] = 1;
				}

				this.traverse(path);
			};
		}
	}

	getCounts(): {} {
		return this.counts;
	}
}

/**
 * Provides an ES6 Proxy handler object which logs all functions call in order
 * does not traverse child nodes
 *
 * @class ProxyVisitsOrder
 */
class ProxyVisitsOrder {
	private visits: string[];
	constructor() {
		this.visits = [];
	}

	has(target, key) {
		return true; // we have everything
	}

	get(target, key, receiver) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		return function (path) {
			let add = "";
			if (key === "visitLiteral") {
				add = ` - ${path.value.raw}`;
			} else if (key === "visitIdentifier") {
				add = ` - ${path.value.name}`;
			}

			that.visits.push(key + add);
		};
	}

	getVisits() {
		return this.visits;
	}
}

/**
 * The actual ASTVisitor tests
 */
describe("ASTVisitor", () => {
	it("should create valid NodePath instances", () => {
		const oAst = recast.parse("(function abc() { return 1; })");
		const oVisitor = new ASTVisitor();

		let bVisitedFile = false,
			bVisitedProgram = false;
		oVisitor.visit(oAst, {
			visitFile(path) {
				bVisitedFile = true;

				assert.strictEqual(typeof path, "object");
				assert.strictEqual(typeof path.value, "object");
				assert.strictEqual(path.parentPath, null);
				assert.strictEqual(path.name, null);

				this.traverse(path);
			},

			visitProgram(path) {
				bVisitedProgram = true;

				assert.strictEqual(typeof path, "object");
				assert.strictEqual(typeof path.parentPath, "object");
				assert.strictEqual(typeof path.value, "object");
				assert.strictEqual(path.name, "program");

				return false;
			},
		});

		assert.ok(bVisitedFile);
		assert.ok(bVisitedProgram);
	});

	it("should visit all nodes", () => {
		const SOURCE_CODE_ALL_NODES =
			"function abc (def, ghi) {\n" +
			"	if (false)\n" +
			"		def = ghi;\n" +
			"	else\n" +
			"		while (false);\n" +
			'	return 3 + "str";\n' +
			"}\n" +
			"const obj = {\n" +
			"	prop: null,\n" +
			"	prop2: (0.3 ? true : !false)\n" +
			"};\n" +
			"abc.bind([5, 6], this);";

		const oAst = recast.parse(SOURCE_CODE_ALL_NODES);
		const oVisitor = new ASTVisitor();
		const oFncts = new ProxyVisitsCounter();
		oVisitor.visit(oAst, new Proxy({}, oFncts));

		assert.deepStrictEqual(oFncts.getCounts(), {
			visitArrayExpression: 1,
			visitAssignmentExpression: 1,
			visitBinaryExpression: 1,
			visitBlockStatement: 1,
			visitBoolean: 4,
			visitCallExpression: 1,
			visitConditionalExpression: 1,
			visitEmptyStatement: 1,
			visitExpressionStatement: 2,
			visitFile: 1,
			visitFunctionDeclaration: 1,
			visitIdentifier: 20,
			visitIfStatement: 1,
			visitKeyword: 7,
			visitLiteral: 10,
			visitMemberExpression: 1,
			visitNull: 1,
			visitNumeric: 4,
			visitObjectExpression: 1,
			visitProgram: 1,
			visitProperty: 2,
			visitPunctuator: 34,
			visitReturnStatement: 1,
			visitString: 1,
			visitThisExpression: 1,
			visitUnaryExpression: 1,
			visitVariableDeclaration: 1,
			visitVariableDeclarator: 1,
			visitWhileStatement: 1,
		});
	});

	it("should visit array nodes in order", () => {
		const SOURCE_CODE_ORDER =
			"alert(5, 7, 9);\n" + "const b = [3, abc, false];\n";

		const oAst = recast.parse(SOURCE_CODE_ORDER);
		const oVisitor = new ASTVisitor();
		let oFncts;

		oFncts = new ProxyVisitsOrder();
		oVisitor.visit(oAst.program.body, new Proxy({}, oFncts));
		assert.deepStrictEqual(oFncts.getVisits(), [
			"visitExpressionStatement",
			"visitVariableDeclaration",
		]);

		oFncts = new ProxyVisitsOrder();
		oVisitor.visit(
			oAst.program.body[0].expression.arguments,
			new Proxy({}, oFncts)
		);
		assert.deepStrictEqual(oFncts.getVisits(), [
			"visitLiteral - 5",
			"visitLiteral - 7",
			"visitLiteral - 9",
		]);

		oFncts = new ProxyVisitsOrder();
		oVisitor.visit(
			oAst.program.body[1].declarations[0].init.elements,
			new Proxy({}, oFncts)
		);
		assert.deepStrictEqual(oFncts.getVisits(), [
			"visitLiteral - 3",
			"visitIdentifier - abc",
			"visitLiteral - false",
		]);
	});

	it("should not visit children unless explicitly stated", () => {
		const oAst = recast.parse("(function abc() { return 1; })");
		const oVisitor = new ASTVisitor();
		let oFncts;
		let bVisited;

		bVisited = false;
		oFncts = new ProxyVisitsCounter();
		oVisitor.visit(
			oAst,
			new Proxy(
				{
					visitFile(path) {
						bVisited = true;
						return false;
					},
				},
				oFncts
			)
		);
		assert.ok(bVisited);

		bVisited = false;
		oFncts = new ProxyVisitsCounter();
		oVisitor.visit(
			oAst,
			new Proxy(
				{
					visitFile(path) {
						bVisited = true;
					},
				},
				oFncts
			)
		);
		assert.ok(bVisited);

		bVisited = false;
		oFncts = new ProxyVisitsCounter();
		oVisitor.visit(
			oAst,
			new Proxy(
				{
					visitFile(path) {
						this.traverse(path);
					},

					visitProgram(path) {
						bVisited = true;
						return false;
					},
				},
				oFncts
			)
		);
		assert.ok(bVisited);
	});

	it("should not reuse protected paths", () => {
		const oAst = recast.parse("(function abc() { return 1; })");
		const oVisitor = new ASTVisitor(undefined, 8); // very small cache size
		let oTestPath = {
			value: {},
			parentPath: {},
			name: "",
		};
		oVisitor.visit(oAst, {
			visitProgram(path) {
				// use program, so there is a parent path
				oTestPath = path.protect();
				return false;
			},
		});
		const oTestPathCopy = Object.assign({}, oTestPath);

		const oBigAst = recast.parse(genRandomJS(256));
		oVisitor.visit(oBigAst, {}); // this should mess with the cache enough

		assert.strictEqual(oTestPath.value, oTestPathCopy.value);
		assert.strictEqual(oTestPath.parentPath, oTestPathCopy.parentPath);
		assert.strictEqual(oTestPath.name, oTestPathCopy.name);
	});
});
