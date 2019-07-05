import * as ESTree from "estree";
const callWithArgumentFinder = require("./CallWithArgumentFinder");
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

import {EMPTY_FINDER_RESULT, Finder, FinderResult} from "../../../dependencies";


class CallWithArgumentFinderWithDependencyCheck implements Finder {
	find(
		node: ESTree.Node, config: { newModulePath: string },
		sConfigName: string, defineCall: SapUiDefineCall): FinderResult {
		const result =
			callWithArgumentFinder.find(node, config, sConfigName, defineCall);
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
module.exports = new CallWithArgumentFinderWithDependencyCheck();