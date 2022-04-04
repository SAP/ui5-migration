import {Syntax} from "esprima";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;
/**
 * Generates scoped getter functions
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

		if (
			oInsertion.type === Syntax.CallExpression &&
			oInsertion.arguments &&
			oInsertion.arguments.length === 1
		) {
			const arg = oInsertion.arguments["0"];

			const oValue = builders.identifier("value");
			const oInnerFn = builders.functionExpression(
				null,
				[],
				builders.blockStatement([builders.returnStatement(oValue)])
			);

			const oBlock = builders.blockStatement([
				builders.returnStatement(oInnerFn),
			]);

			const fnExpression2 = builders.functionExpression(
				null,
				[oValue],
				oBlock
			);
			const fnExpr = builders.callExpression(fnExpression2, [arg]);

			oInsertionPoint[node.parentPath.name] = fnExpr;
		} else {
			throw new Error(
				"insertion is of type " +
					oInsertion.type +
					"(supported are only Call-Expressions"
			);
		}
	},
};

module.exports = replaceable;
