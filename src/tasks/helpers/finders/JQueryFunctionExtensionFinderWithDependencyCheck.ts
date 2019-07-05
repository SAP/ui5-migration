import * as ESTree from "estree";
const jQueryFunctionExtensionFinder =
	require("./JQueryFunctionExtensionFinder");
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

import {EMPTY_FINDER_RESULT, Finder, FinderResult} from "../../../dependencies";


class JQueryFunctionExtensionFinderWithDependencyCheck implements Finder {
	find(
		node: ESTree.Node, config: { newModulePath: string },
		sConfigName: string, defineCall: SapUiDefineCall): FinderResult {
		const result = jQueryFunctionExtensionFinder.find(
			node, config, sConfigName, defineCall);
		if (result === EMPTY_FINDER_RESULT) {
			return EMPTY_FINDER_RESULT;
		} else if (
			config.newModulePath &&
			defineCall.getNodeOfImport(config.newModulePath)) {
			return EMPTY_FINDER_RESULT;
		}
		return result;
	}
}

/**
 *
 */
module.exports = new JQueryFunctionExtensionFinderWithDependencyCheck();