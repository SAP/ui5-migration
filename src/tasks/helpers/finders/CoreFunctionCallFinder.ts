import * as ESTree from "estree";

import {EMPTY_FINDER_RESULT, Finder, FinderResult} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";
import isFunctionCallOnCore from "./utils/isFunctionCallOnCoreInstance";

class CoreFunctionCallFinder implements Finder {
	/**
	 * Finds expression that matches one of the following conditions
	 * <ul>
	 * <li>sap.ui.getCore().FUNCTION_NAME()</li>
	 * <li>Core.FUNCTION_NAME()</li>
	 * <li>oCore.FUNCTION_NAME()</li>
	 * </ul>
	 */
	find(
		node: ESTree.Node,
		config: {functionToFind: string},
		sConfigName: string,
		defineCall: SapUiDefineCall
	): FinderResult {
		if (!config.functionToFind) {
			throw new Error(
				"CoreFunctionCallFinder needs config 'functionToFind'"
			);
		}

		if (isFunctionCallOnCore(node, config.functionToFind)) {
			return {configName: sConfigName};
		} else {
			return EMPTY_FINDER_RESULT;
		}
	}
}

module.exports = new CoreFunctionCallFinder();
