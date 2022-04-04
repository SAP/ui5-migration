import {Syntax} from "esprima";
import * as ESTree from "estree";

import {EMPTY_FINDER_RESULT, Finder, FinderResult} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

/**
 * Finds the following 2 occurrences where: ":sapTabbable" is the first argument
 * <code>
 * jQuery.merge($Ref.parents().prevAll(), $Ref.prevAll()).find(':sapTabbable')
 * var $InteractiveElements = $Cell.find(":sapTabbable, input:sapFocusable,
 * .sapUiTableTreeIcon"); var aTabbables = jQuery(":sapTabbable",
 * that.$()).get();
 * </code>
 */
class AssignReplacementFinder implements Finder {
	find(
		node: ESTree.Node,
		config: {},
		sConfigName: string,
		defineCall: SapUiDefineCall
	): FinderResult {
		if (
			node.type === Syntax.CallExpression &&
			node.callee.type === Syntax.MemberExpression &&
			node.callee.object.type === Syntax.MemberExpression &&
			node.callee.object.object.type === Syntax.Identifier &&
			node.callee.object.object.name === "jQuery" &&
			node.callee.object.property.type === Syntax.Identifier &&
			node.callee.object.property.name === "sap" &&
			node.callee.property.type === Syntax.Identifier &&
			node.callee.property.name === "extend"
		) {
			const arg = node.arguments.length > 0 && node.arguments[0];
			if (arg && arg.type === Syntax.Literal && arg.value === true) {
				return EMPTY_FINDER_RESULT;
			}
			return {configName: sConfigName};
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
module.exports = new AssignReplacementFinder();
