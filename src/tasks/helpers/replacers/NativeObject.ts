import {Syntax} from "esprima";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

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
		const oNodeParent = node.parentPath;
		const oInsertionPoint = oNodeParent.value;
		const aObjectParts = fnName.split(".");

		const oNativeObject = aObjectParts
			.slice(2)
			.reduce((oNativeObject, sProperty) => {
				return builders.memberExpression(
					oNativeObject,
					builders.identifier(sProperty)
				);
			}, builders.memberExpression(builders.identifier(aObjectParts[0]), builders.identifier(aObjectParts[1])));

		if (oInsertionPoint.type === Syntax.IfStatement) {
			oInsertionPoint.test = oNativeObject;
		} else if (oInsertionPoint.type === Syntax.BinaryExpression) {
			oInsertionPoint.right = oNativeObject;
		} else if (
			oInsertionPoint[0] &&
			oInsertionPoint[0].type === Syntax.MemberExpression
		) {
			oInsertionPoint[0] = oNativeObject;
		} else if (oInsertionPoint.type === Syntax.CallExpression) {
			oInsertionPoint[node.name] = oNativeObject;
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
