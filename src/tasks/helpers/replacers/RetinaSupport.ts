import {Syntax} from "esprima";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;
/**
 *
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
		const oInsertion = node.value;

		// CallExpression
		if (oInsertion.type === Syntax.MemberExpression) {
			const oBinaryExpression = builders.binaryExpression(
				">=",
				builders.memberExpression(
					builders.identifier("window"),
					builders.identifier("devicePixelRatio")
				),
				builders.literal(2)
			);
			oInsertionPoint[node.name] = oBinaryExpression;
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
