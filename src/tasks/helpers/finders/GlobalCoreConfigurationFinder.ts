import {Syntax} from "esprima";
import * as ESTree from "estree";

import {EMPTY_FINDER_RESULT, Finder, FinderResult} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

const getPropertyValue = (node: ESTree.Node) => {
	if (node.type === Syntax.Identifier) {
		return node.name;
	}
	return "";
};

class FunctionExtensionFinder implements Finder {
	/**
	 * Finds expression that matches one of the following conditions
	 * <ul>
	 * <li>sap.ui.getCore().getConfiguration()</li>
	 * </ul>
	 */
	find(
		node: ESTree.Node,
		config: {},
		sConfigName: string,
		defineCall: SapUiDefineCall
	): FinderResult {
		const oInterestingNode = node;
		const bGetCoreGetConfigurationCall =
			oInterestingNode.type === Syntax.CallExpression &&
			oInterestingNode.callee.type === Syntax.MemberExpression &&
			oInterestingNode.arguments.length === 0 &&
			getPropertyValue(oInterestingNode.callee.property) ===
				"getConfiguration" &&
			oInterestingNode.callee.object.type === Syntax.CallExpression &&
			oInterestingNode.callee.object.arguments.length === 0 &&
			oInterestingNode.callee.object.callee.type ===
				Syntax.MemberExpression &&
			getPropertyValue(oInterestingNode.callee.object.callee.property) ===
				"getCore" &&
			oInterestingNode.callee.object.callee.object.type ===
				Syntax.MemberExpression &&
			getPropertyValue(
				oInterestingNode.callee.object.callee.object.property
			) === "ui" &&
			getPropertyValue(
				oInterestingNode.callee.object.callee.object.object
			) === "sap";

		if (bGetCoreGetConfigurationCall) {
			return {configName: sConfigName};
		} else {
			return EMPTY_FINDER_RESULT;
		}
	}
}

module.exports = new FunctionExtensionFinder();
