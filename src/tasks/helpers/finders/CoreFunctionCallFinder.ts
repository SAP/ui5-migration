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
		config: {functionName: string},
		sConfigName: string,
		defineCall: SapUiDefineCall
	): FinderResult {
		if (!config.functionName) {
			throw new Error(
				"CoreFunctionCallFinder needs config 'functionName'"
			);
		}

		if (isFunctionCallOnCore(node, config.functionName)) {
			return {configName: sConfigName};
		} else {
			return EMPTY_FINDER_RESULT;
		}
	}
}

module.exports = new CoreFunctionCallFinder();
