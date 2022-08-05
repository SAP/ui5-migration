import {Syntax} from "esprima";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";
import * as ESTree from "estree";

const builders = recast.types.builders;

/**
 * represents a module function which exposes itself as function
 * Module: encodeXML
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
		let bReplaced = false;
		if (oInsertion.type === Syntax.CallExpression) {
			const oldArgs = oInsertion.arguments;
			if (oldArgs.length === 0) {
				let args = [];
				if (fnName) {
					const oAst = recast.parse(fnName).program.body[
						"0"
					] as ESTree.ExpressionStatement;
					args = [oAst];
				}
				oInsertionPoint[node.parentPath.name] = builders.newExpression(
					builders.identifier(name),
					args
				);
				bReplaced = true;
			}
		}
		if (!bReplaced) {
			throw new Error(
				"insertion is of type " +
					oInsertion.type +
					"(supported are only Call- and Member-Expressions)"
			);
		}
	},
};

module.exports = replaceable;
