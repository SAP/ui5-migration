import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
 * Replaces existing call with <code>sId ? (oWindow ||
 * window).document.getElementById(sId) : null;</code>
 *
 * @param {recast.NodePath} node The top node of the module reference
 * @param {string} name The name of the new module
 * @param {string} fnName The name of the function inside the new module
 * @param {string} oldModuleCall The old import name
 * @returns {void}
 */
const replaceable: ASTReplaceable = {
	replace(
		node: NodePath,
		name: string,
		fnName: string,
		oldModuleCall: string
	): void {
		const oInsertionPoint = node.parentPath.parentPath.value;
		const oInsertion = node.parentPath.value;

		// "window.document.getElementById"
		const oMemberExpression = builders.memberExpression(
			builders.identifier("window"),
			builders.memberExpression(
				builders.identifier("document"),
				builders.identifier("getElementById"),
				false
			),
			false
		);

		// CallExpression
		if (oInsertion.type === Syntax.CallExpression) {
			const oWindow: ESTree.Expression = builders.identifier("window");
			const oCustomWindow = oInsertion.arguments[1] as ESTree.Expression;
			const oIdExpression = oInsertion.arguments[0] as ESTree.Expression;

			if (oCustomWindow) {
				// (arg1 || window).document.getElementById
				oMemberExpression.object = builders.logicalExpression(
					"||",
					oCustomWindow,
					oWindow
				);
			}
			let oRootExpression: ESTree.Expression = builders.callExpression(
				oMemberExpression,
				[oIdExpression]
			);

			// sId ? (oWindow || window).document.getElementById(sId) : null;
			if (oIdExpression.type !== Syntax.Literal) {
				oRootExpression = builders.conditionalExpression(
					oIdExpression,
					oRootExpression,
					builders.literal(null)
				);
			}

			oInsertionPoint[node.parentPath.name] = oRootExpression;
		} else if (oInsertion.type === Syntax.AssignmentExpression) {
			oInsertion.right = oMemberExpression;
		} else if (oInsertion.type === Syntax.VariableDeclarator) {
			oInsertion.init = oMemberExpression;
		} else {
			throw new Error(
				"insertion is of type " +
					oInsertion.type +
					"(supported are only Call-Expressions)"
			);
		}
	},
};

module.exports = replaceable;
