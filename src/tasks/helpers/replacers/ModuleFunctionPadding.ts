import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

import * as CommentUtils from "../../../util/CommentUtils";

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
		const oInsertionPoint = node.parentPath.value;
		const oInsertion = node.value;

		// CallExpression
		if (oInsertionPoint.type === Syntax.CallExpression) {
			const padString = oInsertionPoint.arguments[1];

			if (
				padString.type === Syntax.Literal &&
				typeof padString.value === "string" &&
				padString.value.length === 1
			) {
				const aParams = [oInsertionPoint.arguments[2], padString];
				const strName = oInsertionPoint
					.arguments[0] as ESTree.Expression;

				oInsertionPoint.callee = builders.memberExpression(
					strName,
					builders.identifier(fnName)
				);
				oInsertionPoint.arguments = aParams;
			} else {
				CommentUtils.addComment(node, "TODO: Remove padding call");
			}
		} else {
			throw new Error(
				"insertion is of type " +
					oInsertion.type +
					"(supported are only Call- and Member-Expressions)"
			);
		}
	},
};

module.exports = replaceable;
