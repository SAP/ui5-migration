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

const isNamedFunctionCall = (node, name) => {
	return (
		node.type === Syntax.CallExpression &&
		node.arguments.length === 0 &&
		getPropertyValue(node.callee.property) === name
	);
};

class GlobalCoreConfigurationFinder implements Finder {
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
		const bGetCoreGetConfigurationCall =
			node.type === Syntax.CallExpression &&
			isNamedFunctionCall(node, "getConfiguration") &&
			node.callee.type === Syntax.MemberExpression &&
			node.callee.object.type === Syntax.CallExpression &&
			isNamedFunctionCall(node.callee.object, "getCore") &&
			node.callee.object.callee.type === Syntax.MemberExpression &&
			node.callee.object.callee.object.type === Syntax.MemberExpression &&
			getPropertyValue(node.callee.object.callee.object.property) ===
				"ui" &&
			getPropertyValue(node.callee.object.callee.object.object) === "sap";

		if (bGetCoreGetConfigurationCall) {
			return {configName: sConfigName};
		} else {
			return EMPTY_FINDER_RESULT;
		}
	}
}

module.exports = new GlobalCoreConfigurationFinder();
