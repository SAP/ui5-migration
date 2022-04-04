import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
 * Replaces <code>jQuery.inArray(oElement, aElements)</code>
 * With <code>(aElements ? Array.prototype.indexOf.call(aElements, oElement) :
 * -1)</code>
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
		const oInsertionPointParentValue =
			node.parentPath.parentPath.parentPath.value;
		const oInsertionPoint = node.parentPath.parentPath.value;
		const oInsertion = node.parentPath.value;

		// CallExpression
		if (
			oInsertion.type === Syntax.CallExpression &&
			oInsertion.arguments.length > 1
		) {
			// change the order of the first 2 arguments
			const tmpArg = oInsertion.arguments[0];
			oInsertion.arguments[0] = oInsertion.arguments[1]; // aElements
			oInsertion.arguments[1] = tmpArg; // oElement
			const aArray = oInsertion.arguments[0] as ESTree.Expression;
			if (aArray.type === Syntax.ArrayExpression) {
				const oReplacement = builders.callExpression(
					builders.memberExpression(
						aArray,
						builders.identifier("indexOf")
					),
					[oInsertion.arguments[1]]
				);
				oInsertionPoint[node.parentPath.name] = oReplacement;
			} else {
				// Array.prototype.indexOf.call
				const oNodeIndexOfCall = builders.memberExpression(
					builders.identifier("Array"),
					builders.memberExpression(
						builders.identifier("prototype"),
						builders.memberExpression(
							builders.identifier("indexOf"),
							builders.identifier("call"),
							false
						),
						false
					),
					false
				);

				// binary expression such as:	var i = jQuery.inArray(o, a) >
				// -1; should result in:			var i = a &&
				// Array.prototype.indexOf.call(a, o) > -1;
				if (oInsertionPoint.type === Syntax.BinaryExpression) {
					oInsertionPoint[node.parentPath.name] =
						builders.callExpression(
							oNodeIndexOfCall,
							oInsertion.arguments
						);
					const oLogicalExpression = builders.logicalExpression(
						"&&",
						aArray,
						oInsertionPoint
					);

					oInsertionPointParentValue[
						node.parentPath.parentPath.name
					] = oLogicalExpression;
				} else {
					// jQuery.inArray(oElement, aElements)
					// --> aElements ? Array.prototype.indexOf.call(aElements,
					// oElement) : -1

					const oConditionalExpression =
						builders.conditionalExpression(
							aArray,
							builders.callExpression(
								oNodeIndexOfCall,
								oInsertion.arguments
							),
							builders.unaryExpression(
								"-",
								builders.literal(1),
								true
							)
						);

					oInsertionPoint[node.parentPath.name] =
						oConditionalExpression;
				}
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
