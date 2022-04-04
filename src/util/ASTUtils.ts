import {Syntax} from "esprima";
import * as ESTree from "estree";

import {ASTVisitor, TNodePath} from "./ASTVisitor";

export type CallCondition = (call: TNodePath<ESTree.CallExpression>) => boolean;

/**
 * Find function calls which can be filtered
 */
export function findCalls(
	ast: ESTree.Node,
	cond?: CallCondition,
	visitor?: ASTVisitor
): Array<TNodePath<ESTree.CallExpression>> {
	const results = [];

	if (!visitor) {
		visitor = new ASTVisitor();
	}
	visitor.visit(ast, {
		visitCallExpression(path) {
			if (!cond || cond(path)) {
				path.protect();
				results.push(path);
				return false; // no nested extend calls
			}
			this.traverse(path);
			return undefined;
		},
	});

	return results;
}

/**
 * @returns the identifier chain in a member expression as an array
 */
export function getMemberExprParts(ast: ESTree.MemberExpression): string[] {
	const parts: string[] = [];
	let curAst: ESTree.Node = ast;
	if (curAst.property.type !== Syntax.Identifier) {
		return parts;
	}

	do {
		parts.unshift(curAst.property.name);
		curAst = curAst.object;
	} while (
		curAst &&
		curAst.type === Syntax.MemberExpression &&
		curAst.property.type === Syntax.Identifier
	);

	if (curAst.type === Syntax.Identifier) {
		parts.unshift(curAst.name);
	} else if (curAst.type === Syntax.ThisExpression) {
		parts.unshift("this");
	}
	return parts;
}

/**
 * Determines whether arg references a constant object
 *
 * @param {ESTree.Expression} arg
 * @returns {boolean}
 */
export function hasConstantValue(arg: ESTree.Node): boolean {
	if (arg.type === Syntax.Literal || arg.type === Syntax.Identifier) {
		return true;
	} else if (arg.type === Syntax.MemberExpression) {
		return hasConstantValue(arg.object) && hasConstantValue(arg.property);
	} else {
		return false;
	}
}
