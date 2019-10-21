import * as ESTree from "estree";
const jQueryFunctionExtensionFinder = require("./JQueryFunctionExtensionFinder");
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

import {EMPTY_FINDER_RESULT, Finder, FinderResult} from "../../../dependencies";

/**
 * @see JQueryFunctionExtensionFinder but checks the dependencies if the newModulePath is already in the config
 */
class JQueryFunctionExtensionFinderWithDependencyCheck implements Finder {
	find(
		node: ESTree.Node,
		config: {newModulePath: string},
		sConfigName: string,
		defineCall: SapUiDefineCall
	): FinderResult {
		const result = jQueryFunctionExtensionFinder.find(
			node,
			config,
			sConfigName,
			defineCall
		);
		// if the result is already empty or the dependency is already present
		// nothing is found
		if (
			result === EMPTY_FINDER_RESULT ||
			(config.newModulePath &&
				defineCall.getNodeOfImport(config.newModulePath))
		) {
			return EMPTY_FINDER_RESULT;
		}
		return result;
	}
}

/**
 *
 */
module.exports = new JQueryFunctionExtensionFinderWithDependencyCheck();
