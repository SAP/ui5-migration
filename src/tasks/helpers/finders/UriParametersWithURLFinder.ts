import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {NodePath} from "ui5-migration";

import {EMPTY_FINDER_RESULT, Finder, FinderResult} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";
const newExpressionFinder = require("./NewExpressionFinder");

/**
 * Finds new expressions of UriParameters and check arguments for neither being window.location.href nor window.location.search
 *
 * <code>
 * new UriParameters(window.location.href)
 * </code>
 *
 */
class UriParametersWithURLFinder implements Finder {
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
			node.type === Syntax.NewExpression &&
			newExpressionFinder.find(node, config, sConfigName, defineCall) !==
				EMPTY_FINDER_RESULT
		) {
			const firstArgumentPrinted = print(node.arguments[0]);
			if (
				firstArgumentPrinted !== "window.location.href" &&
				firstArgumentPrinted !== "window.location.search"
			) {
				return {configName: sConfigName};
			}
		}

		return EMPTY_FINDER_RESULT;
	}
}

function evaluateExpressions(parameter) {
	return recast.parse(parameter).program.body["0"].expression;
}

function compareAsts(ast1, ast2) {
	return print(ast1) === print(ast2);
}

function print(ast) {
	return recast.print(ast).code;
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
module.exports = new UriParametersWithURLFinder();
