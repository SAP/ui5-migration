import {Syntax} from "esprima";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
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
		const oNodeCall = builders.callExpression(
			builders.identifier(name),
			[]
		);

		if (oInsertionPoint.type === Syntax.IfStatement) {
			// if(jQuery.sap.isMouseEventDelayed)
			oInsertionPoint.test = oNodeCall;
		} else if (oInsertionPoint.type === Syntax.VariableDeclarator) {
			// var test =
			// jQuery.sap.isMouseEventDelayed
			oInsertionPoint.init = oNodeCall;
		} else if (
			oInsertionPoint.type === Syntax.AssignmentExpression &&
			node.name === "right"
		) {
			// test = jQuery.sap.isMouseEventDelayed and
			// NOT jQuery.sap.isMouseEventDelayed = test
			oInsertionPoint.right = oNodeCall;
		} else if (oInsertionPoint.type === Syntax.LogicalExpression) {
			// test &&
			// jQuery.sap.isMouseEventDelayed
			// || test2
			oInsertionPoint[node.name] = oNodeCall;
		} else {
			throw new Error(
				"insertion is of type " +
					oInsertionPoint.type +
					" is not supported"
			);
		}
	},
};

module.exports = replaceable;
