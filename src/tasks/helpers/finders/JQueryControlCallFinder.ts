import {Syntax} from "esprima";
import * as ESTree from "estree";

import {EMPTY_FINDER_RESULT, Finder, FinderResult} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

const includesJQuery = (node: ESTree.Identifier) => {
	return (
		node.name.includes("$") || node.name.toLowerCase().includes("jquery")
	);
};
const isControlCall = (node: ESTree.Node) => {
	return (
		node.type === Syntax.CallExpression &&
		node.callee.type === Syntax.MemberExpression &&
		node.callee.property.type === Syntax.Identifier &&
		node.callee.property.name === "control"
	);
};

const hasIntArg = (node: ESTree.Node) => {
	// checks whether a function call has the first parameter set with integer
	return (
		node.type === Syntax.CallExpression &&
		node.arguments[0] &&
		node.arguments[0].type === Syntax.Literal &&
		typeof node.arguments[0].value === "number"
	);
};

const hasVarArgWithJQuery = (node: ESTree.Node) => {
	// checks whether a function is called with a variable and the callee's object includes jQuery
	if (
		node.type === Syntax.CallExpression &&
		node.arguments[0] &&
		node.arguments[0].type === Syntax.Identifier
	) {
		const object = (node.callee as ESTree.MemberExpression).object;
		if (object.type === Syntax.Identifier) {
			return includesJQuery(object);
		}
	}

	return false;
};

class FunctionExtensionFinder implements Finder {
	/**
	 * Finds expression that matches one of the following conditions
	 * <ul>
	 * <li>EXPRESSION.control(INT, ...)</li>
	 * <li>EXPRESSION.control()[INT]</li>
	 * <li>jQuery(...).control(VAR)</li>
	 * <li>VAR(...).control(VAR1) where VAR contains "$"</li>
	 * </ul>
	 */
	find(
		node: ESTree.Node,
		config: {},
		sConfigName: string,
		defineCall: SapUiDefineCall
	): FinderResult {
		// checks
		// EXPRESSION.control(INT, ...)
		// jQuery(...).control(VAR) and VAR(...).control(VAR1) where VAR contains "$"
		const bControlCallWithIntegerParam =
			isControlCall(node) &&
			(hasIntArg(node) || hasVarArgWithJQuery(node));

		// checks EXPRESSION.control()[INT]
		const bMemberWithIndexContainsControlCall =
			node.type === Syntax.MemberExpression &&
			isControlCall(node.object) &&
			((node.property.type === Syntax.Literal &&
				typeof node.property.value === "number") ||
				(node.property.type === Syntax.Identifier &&
					node.object.type === Syntax.CallExpression &&
					node.object.callee.type === Syntax.Identifier &&
					includesJQuery(node.object.callee)));

		if (
			bControlCallWithIntegerParam ||
			bMemberWithIndexContainsControlCall
		) {
			return {configName: sConfigName};
		} else {
			return EMPTY_FINDER_RESULT;
		}
	}
}

module.exports = new FunctionExtensionFinder();
