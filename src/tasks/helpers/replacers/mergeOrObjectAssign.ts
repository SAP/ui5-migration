import {Syntax} from "esprima";
import * as recast from "recast";
import {ASTReplaceable, ASTReplaceableResult, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
 * Replaces jQuery.sap.extend with either Object.assign (shallow) or
 * sap/base/util/merge (deep)
 *
 * @param {recast.NodePath} node The top node of the module reference
 * @param {string} name The name of the new module
 * @param {string} fnName The name of the function inside the new module
 * @param {string} oldModuleCall The old import name
 * @param config
 * @returns {void}
 */
const replaceable: ASTReplaceable = {
	replace(
		node: NodePath,
		name: string,
		fnName: string,
		oldModuleCall: string,
		config: {newVariableName: string}
	): ASTReplaceableResult | void {
		const oInsertion = node.parentPath.value;

		// CallExpression
		if (oInsertion.type === Syntax.CallExpression) {
			const oInsertionPoint = node.parentPath.parentPath.value;

			const arg0 = oInsertion.arguments[0];
			let bDeepCopy = false;
			if (
				arg0.type === Syntax.Literal &&
				typeof arg0.value === "boolean"
			) {
				oInsertion.arguments.shift();
				bDeepCopy = arg0.value;
			}

			if (bDeepCopy) {
				oInsertionPoint[node.parentPath.name] = builders.callExpression(
					builders.identifier(name || config.newVariableName),
					oInsertion.arguments
				);
			} else {
				oInsertionPoint[node.parentPath.name] = builders.callExpression(
					builders.memberExpression(
						builders.identifier("Object"),
						builders.identifier("assign")
					),
					oInsertion.arguments
				);
				return {modified: false, addDependency: false};
			}
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
