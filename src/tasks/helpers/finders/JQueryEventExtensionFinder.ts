import {Syntax} from "esprima";
import * as ESTree from "estree";

import {EMPTY_FINDER_RESULT, Finder, FinderResult} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

class JQueryEventExtensionFinder implements Finder {
	find(
		node: ESTree.Node,
		config: {finderIncludesName: string},
		sConfigName: string,
		defineCall: SapUiDefineCall
	): FinderResult {
		const oObject = sConfigName.split(".");
		if (node.type === Syntax.MemberExpression) {
			if (
				node.object.type === Syntax.Identifier &&
				node.object.name
					.toLowerCase()
					.includes(config.finderIncludesName)
			) {
				if (
					node.property.type === Syntax.Identifier &&
					node.property.name === oObject[1]
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
module.exports = new JQueryEventExtensionFinder();
