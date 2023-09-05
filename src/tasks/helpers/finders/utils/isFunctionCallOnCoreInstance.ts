import {Syntax} from "esprima";
import * as ESTree from "estree";

const getPropertyValue = (node: ESTree.Node) => {
	if (node.type === Syntax.Identifier) {
		return node.name;
	}
	return "";
};

const isNamedFunctionCall = (node: ESTree.Node, name: string) => {
	return (
		node.type === Syntax.CallExpression &&
		node.callee.type === Syntax.MemberExpression &&
		getPropertyValue(node.callee.property) === name
	);
};

/**
 * check whether the node is a function call on a core instance and the function name should be identical to
 * the given <code>functionName</code>
 *
 * For example:
 *  sap.ui.getCore().functionCall()
 *  oCore.functionCall()
 */

export default function (node: ESTree.Node, functionName: string): boolean {
	return (
		node.type === Syntax.CallExpression &&
		isNamedFunctionCall(node, functionName) &&
		node.callee.type === Syntax.MemberExpression &&
		((node.callee.object.type === Syntax.Identifier &&
			node.callee.object.name.toLowerCase().includes("core")) ||
			(node.callee.object.type === Syntax.CallExpression &&
				isNamedFunctionCall(node.callee.object, "getCore") &&
				node.callee.object.callee.type === Syntax.MemberExpression &&
				node.callee.object.callee.object.type ===
					Syntax.MemberExpression &&
				getPropertyValue(node.callee.object.callee.object.property) ===
					"ui" &&
				getPropertyValue(node.callee.object.callee.object.object) ===
					"sap"))
	);
}
