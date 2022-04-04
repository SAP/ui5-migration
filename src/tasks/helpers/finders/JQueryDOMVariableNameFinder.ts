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
class JQueryDOMVariableNameFinder implements Finder {
	find(
		node: ESTree.Node,
		config: {variableNameToFind: string},
		sConfigName: string,
		defineCall: SapUiDefineCall
	): FinderResult {
		const sNameToFind = config.variableNameToFind;

		if (node.type === Syntax.Identifier && node.name === sNameToFind) {
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
module.exports = new JQueryDOMVariableNameFinder();
