import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";
import * as ESTree from "estree";

/**
 * Generates a noop function
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
		const sText = "(function() {})";
		const expressionStatement = recast.parse(sText).program.body[
			"0"
		] as ESTree.ExpressionStatement;

		node.parentPath.value[node.name] = expressionStatement.expression;
	},
};

module.exports = replaceable;
