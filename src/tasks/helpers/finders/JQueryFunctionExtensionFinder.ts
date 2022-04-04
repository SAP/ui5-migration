import {Syntax} from "esprima";
import * as ESTree from "estree";

import {EMPTY_FINDER_RESULT, Finder, FinderResult} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

function includesJQuery(node) {
	return (
		node.name.includes("$") || node.name.toLowerCase().includes("jquery")
	);
}

class FunctionExtensionFinder implements Finder {
	find(
		node: ESTree.Node,
		config: {},
		sConfigName: string,
		defineCall: SapUiDefineCall
	): FinderResult {
		const oObject = sConfigName.split(".");
		if (oObject.length !== 2) {
			return undefined;
		}
		const sFunctionName = oObject[1];
		if (
			node.type === Syntax.MemberExpression &&
			node.property.type === Syntax.Identifier &&
			node.property.name === sFunctionName
		) {
			if (node.object.type === Syntax.CallExpression) {
				if (
					node.object.callee.type === Syntax.Identifier &&
					includesJQuery(node.object.callee)
				) {
					return {configName: sConfigName};
				} else if (
					node.object.callee.type === Syntax.MemberExpression &&
					node.object.callee.property.type === Syntax.Identifier &&
					includesJQuery(node.object.callee.property)
				) {
					return {configName: sConfigName};
				}
			} else if (
				node.object.type === Syntax.Identifier &&
				includesJQuery(node.object)
			) {
				return {configName: sConfigName};
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
