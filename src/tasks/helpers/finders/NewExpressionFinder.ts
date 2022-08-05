import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";

import {EMPTY_FINDER_RESULT, Finder, FinderResult} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

/**
 * Finds new expressions if the number of arguments match and the callee name.
 *
 *
 * <code>
 * new UriParameters(arg1)
 * </code>
 *
 * would match config
 * <code>
 * {
 *     newExpressionArgsLength: 1,
 *     newExpressionCalleeName: UriParameters
 * }
 * </code>
 *
 * To ignore the number of arguments, simply leave undefined or provide a negative number
 */
class NewExpressionFinder implements Finder {
	find(
		node: ESTree.Node,
		config: {
			newExpressionArgsLength: number;
			newExpressionArgs: string[];
			newExpressionCalleeName: string;
			importPath: string;
		},
		sConfigName: string,
		defineCall: SapUiDefineCall
	): FinderResult {
		// check import (from SapUiDefineCall)
		if (
			config.importPath &&
			defineCall.getImportByParamName(config.newExpressionCalleeName) !==
				config.importPath
		) {
			return EMPTY_FINDER_RESULT;
		}

		// check that it is a new-expression
		if (node.type !== Syntax.NewExpression) {
			return EMPTY_FINDER_RESULT;
		}

		// check that the callee matches
		if (
			node.callee.type !== Syntax.Identifier ||
			node.callee.name !== config.newExpressionCalleeName
		) {
			return EMPTY_FINDER_RESULT;
		}

		// check content of each argument
		if (config.newExpressionArgs) {
			const newExpressionArgsAsts = [];
			config.newExpressionArgs.forEach(expression => {
				newExpressionArgsAsts.push(evaluateExpressions(expression));
			});

			if (compareAsts(node.arguments, newExpressionArgsAsts)) {
				return {configName: sConfigName};
			}
		} else {
			// check number of arguments
			if (node.arguments.length === config.newExpressionArgsLength) {
				return {configName: sConfigName};
			} else if (
				!config.newExpressionArgsLength ||
				config.newExpressionArgsLength < 0
			) {
				return {configName: sConfigName};
			}
		}

		return EMPTY_FINDER_RESULT;
	}
}

function evaluateExpressions(parameter) {
	const expressionStatement = recast.parse(parameter).program.body[
		"0"
	] as ESTree.ExpressionStatement;
	return expressionStatement.expression;
}

function compareAsts(ast1, ast2) {
	if (
		Array.isArray(ast1) &&
		Array.isArray(ast2) &&
		ast1.length === ast2.length
	) {
		for (let i = 0; i < ast1.length; i++) {
			const ast1Element = ast1[i];
			const ast2Element = ast2[i];
			if (!compareAsts(ast1Element, ast2Element)) {
				return false;
			}
		}
		return true;
	}
	try {
		return recast.print(ast1).code === recast.print(ast2).code;
	} catch (e) {
		return false;
	}
}

/**
 *
 *
 * @param {recast.NodePath} node The top node of the module reference
 * @param {string} name The name of the new module
 * @param {string} fnName The name of the function inside the new module
 * @param {string} oldModuleCall The old import name
 * @returns {void}
 */
module.exports = new NewExpressionFinder();
