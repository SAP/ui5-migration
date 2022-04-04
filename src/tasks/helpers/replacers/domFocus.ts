import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

import {hasConstantValue} from "../../../util/ASTUtils";

const builders = recast.types.builders;

/**
 * replaces an imported module function with a method already in the (first)
 * parameter e.g. "jQuery.sap.focus(domEle)" ->
 * "domEle?domEle.focus():undefined"
 *
 * @param {recast.NodePath} node The top node of the module reference
 * @param {string} name The name of the new module
 * @param {string} fnName The name of the method
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
		const oFunctionCall = node.parentPath.value;
		const oInsertionPoint = node.parentPath.parentPath.value;
		const sInsertionKey = node.parentPath.name;

		if (oFunctionCall.type === Syntax.CallExpression) {
			if (oFunctionCall.arguments.length === 0) {
				if (
					oInsertionPoint.type === Syntax.VariableDeclarator ||
					oInsertionPoint.type === Syntax.AssignmentExpression
				) {
					oInsertionPoint[sInsertionKey] =
						builders.identifier("undefined");
				}
			} else if (oFunctionCall.arguments.length > 0) {
				const oArg = oFunctionCall.arguments[0];

				if (
					oArg.type === Syntax.Literal ||
					oArg.type === Syntax.SpreadElement
				) {
					throw new Error(
						"Argument value is not constant, incompatible changes would occur"
					);
				} else if (
					oInsertionPoint.type === Syntax.ExpressionStatement
				) {
					// good case
					const oFocusCall = builders.callExpression(
						builders.memberExpression(
							oArg,
							builders.identifier("focus")
						),
						[]
					);
					const ifStatament = builders.ifStatement(
						oArg,
						builders.blockStatement([
							builders.expressionStatement(oFocusCall),
						])
					);

					// replace expression statement
					node.parentPath.parentPath.parentPath.value[
						node.parentPath.parentPath.name
					] = ifStatament;
					return;
				} else if (hasConstantValue(oArg)) {
					oInsertionPoint[sInsertionKey] =
						builders.conditionalExpression(
							oArg,
							builders.logicalExpression(
								"||",
								oFunctionCall,
								builders.identifier("true")
							),
							builders.identifier("undefined")
						);
				} else {
					oInsertionPoint[sInsertionKey] = builders.identifier(
						"(function(o){return o ? o.focus() || true : undefined;}(" +
							recast.print(oArg).code +
							"))"
					);
				}
				oFunctionCall.arguments.shift();
				(oFunctionCall.callee as ESTree.MemberExpression).object = oArg;
			}
		} else {
			throw new Error(
				"insertion is of type " +
					oFunctionCall.type +
					"(supported are only Call-Expressions)"
			);
		}
	},
};

module.exports = replaceable;
