import {Syntax} from "../../../Migration";
import * as ESTree from "estree";

import {EMPTY_FINDER_RESULT, Finder, FinderResult} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

const getPropertyValue = (node: ESTree.Node) => {
	if (node.type === Syntax.Identifier) {
		return node.name;
	}
	return "";
};

class GlobalGetCoreFinder implements Finder {
	/**
	 * Finds expression that matches one of the following conditions
	 * <ul>
	 * <li>sap.ui.getCore()</li>
	 * </ul>
	 */
	find(
		node: ESTree.Node,
		config: {},
		sConfigName: string,
		defineCall: SapUiDefineCall
	): FinderResult {
		const bGetCoreCall =
			node.type === Syntax.CallExpression &&
			node.arguments.length === 0 &&
			node.callee.type === Syntax.MemberExpression &&
			getPropertyValue(node.callee.property) === "getCore" &&
			node.callee.object.type === Syntax.MemberExpression &&
			getPropertyValue(node.callee.object.property) === "ui" &&
			getPropertyValue(node.callee.object.object) === "sap";

		if (bGetCoreCall) {
			return {configName: sConfigName};
		} else {
			return EMPTY_FINDER_RESULT;
		}
	}
}

module.exports = new GlobalGetCoreFinder();
