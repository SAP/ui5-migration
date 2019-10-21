import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
 * Performs a native function call with check argument for null
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
		const oInsertionPoint = node.parentPath.value;

		// CallExpression
		if (oInsertionPoint.type === Syntax.CallExpression) {
			oInsertionPoint.callee = builders.memberExpression(
				builders.identifier(name),
				builders.identifier(fnName)
			);
			if (
				oInsertionPoint.arguments[0] &&
				oInsertionPoint.arguments[0].type !== Syntax.ObjectExpression
			) {
				oInsertionPoint.arguments[0] = builders.logicalExpression(
					"||",
					oInsertionPoint.arguments[0] as ESTree.Expression,
					builders.identifier("null")
				);
			}
		} else {
			throw new Error(
				"insertion is of type " +
					oInsertionPoint.type +
					"(supported are only Call-Expressions)"
			);
		}
	},
};

module.exports = replaceable;
