import {Syntax} from "esprima";
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

		// CallExpression
		if (oInsertion.type === Syntax.CallExpression) {
			const aArgs = oInsertionPoint[node.parentPath.name].arguments;
			const ident = builders.identifier(name);

			oInsertionPoint[node.parentPath.name] = builders.binaryExpression(
				"instanceof",
				aArgs[0],
				ident
			);
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
