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
	const sFunctionName = "control";
	return (
		node.type === Syntax.CallExpression &&
		node.callee.type === Syntax.MemberExpression &&
		node.callee.property.type === Syntax.Identifier &&
		node.callee.property.name === sFunctionName
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
	find(
		node: ESTree.Node,
		config: {},
		sConfigName: string,
		defineCall: SapUiDefineCall
	): FinderResult {
		const bControlCallWithIntegerParam =
			isControlCall(node) &&
			(hasIntArg(node) || hasVarArgWithJQuery(node));

		// checks jQuery(oDOM).control()[0]
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

/**
 *
 *
 * @param {recast.NodePath} node The top node of the module reference
 * @param {string} name The name of the new module
 * @param {string} fnName The name of the function inside the new module
 * @param {string} oldModuleCall The old import name
 * @returns {void}
 */
module.exports = new FunctionExtensionFinder();
