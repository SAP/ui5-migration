import {Syntax} from "esprima";
import * as ESTree from "estree";

import {EMPTY_FINDER_RESULT, Finder, FinderResult} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

class FunctionExtensionFinder implements Finder {
	find(
		node: ESTree.Node,
		config: {},
		sConfigName: string,
		defineCall: SapUiDefineCall
	): FinderResult {
		const oObject = sConfigName.split(".");
		if (node.type === Syntax.CallExpression) {
			const callee = node.callee;
			if (
				oObject[0] === "*" ||
				(callee.type === Syntax.MemberExpression &&
					callee.object.type === Syntax.Identifier &&
					callee.object.name === oObject[0])
			) {
				// check property
				if (
					callee.type === Syntax.MemberExpression &&
					callee.property.type === Syntax.Identifier &&
					callee.property.name === oObject[1]
				) {
					return {configName: sConfigName};
				}
			}
		}
		return EMPTY_FINDER_RESULT;
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
module.exports = new FunctionExtensionFinder();
