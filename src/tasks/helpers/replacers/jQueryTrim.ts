import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, ASTReplaceableResult, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
 * Replaces jQuery.trim
 *
 * @example trim replacement
 * jQuery.trim(x);
 * typeof x === "string" ? x.trim() : x != null ? String(x).trim() : "";
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
	): ASTReplaceableResult | void {
		const oInsertionPoint = node.parentPath.value;
		const oActualInsertionPoint = node.parentPath.parentPath.value;
		if (
			oInsertionPoint.type === Syntax.CallExpression &&
			oInsertionPoint.arguments.length === 1
		) {
			const arg0 = oInsertionPoint.arguments[0] as ESTree.Expression;
			const trimCall: ESTree.Expression = builders.callExpression(
				builders.memberExpression(
					arg0,
					builders.identifier("trim"),
					false
				),
				[]
			);

			const trimCallForString: ESTree.Expression =
				builders.callExpression(
					builders.memberExpression(
						builders.callExpression(builders.identifier("String"), [
							arg0,
						]),
						builders.identifier("trim"),
						false
					),
					[]
				);

			const typeOfString = builders.binaryExpression(
				"===",
				builders.unaryExpression("typeof", arg0),
				builders.literal("string")
			);

			const alternative = builders.conditionalExpression(
				builders.binaryExpression("!=", arg0, builders.literal(null)),
				trimCallForString,
				builders.literal("")
			);
			const condition = builders.conditionalExpression(
				typeOfString,
				trimCall,
				alternative
			);

			oActualInsertionPoint[node.parentPath.name] = condition;
			return {modified: false, addDependency: false};
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
