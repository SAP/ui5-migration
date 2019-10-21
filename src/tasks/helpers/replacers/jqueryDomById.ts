import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
 * Replaces jQuery.sap.byId with jQuery(document.getElementById(...))
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
		const oInsertion = node.parentPath.value as ESTree.CallExpression;

		// CallExpression
		if (oInsertion.type === Syntax.CallExpression) {
			// jQuery(document.getElementById(args[0]))
			const oNewCall = builders.callExpression(
				builders.identifier(name),
				[
					builders.callExpression(
						builders.memberExpression(
							builders.identifier("document"),
							builders.identifier("getElementById")
						),
						[oInsertion.arguments[0]]
					),
				]
			);

			oInsertionPoint[node.parentPath.name] = oNewCall;
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
