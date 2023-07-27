import * as ESTree from "estree";

import {EMPTY_FINDER_RESULT, Finder, FinderResult} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";
import isFunctionCallOnFormatSettings from "./utils/isFunctionCallOnFormatSettingsInstance";

class ConfigurationFunctionCallFinder implements Finder {
	find(
		node: ESTree.Node,
		config: {functionToFind: string},
		sConfigName: string,
		defineCall: SapUiDefineCall
	): FinderResult {
		if (!config.functionToFind) {
			throw new Error(
				"FormatSettingsFunctionCallFinder needs config 'functionToFind'"
			);
		}

		if (isFunctionCallOnFormatSettings(node, config.functionToFind)) {
			return {configName: sConfigName};
		} else {
			return EMPTY_FINDER_RESULT;
		}
	}
}

module.exports = new ConfigurationFunctionCallFinder();
