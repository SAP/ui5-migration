import {Syntax} from "esprima";
import * as recast from "recast";
import {ASTReplaceable, ASTReplaceableResult, NodePath} from "ui5-migration";

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
	): ASTReplaceableResult | void {
		const oInsertionPoint = node.parentPath.value;
		const oInsertion = node.value;
		const oNodeName = builders.identifier(name);

		// arrays do not have a type
		if (Array.isArray(oInsertionPoint)) {
			oInsertionPoint[node.name] = oNodeName;
			return;
		}

		// CallExpression
		if (oInsertion.type === Syntax.CallExpression) {
			// e.g. jQuery(oElement).replaceWith(...);
			oInsertion.callee = oNodeName;
		} else if (oInsertionPoint.type === Syntax.CallExpression) {
			oInsertionPoint.callee = oNodeName;
		} else if (oInsertionPoint.type === Syntax.MemberExpression) {
			oInsertionPoint.object = oNodeName;
		} else if (oInsertionPoint.type === Syntax.VariableDeclarator) {
			oInsertionPoint.init = oNodeName;
		} else if (oInsertionPoint.type === Syntax.BinaryExpression) {
			oInsertionPoint[node.name] = oNodeName;
		} else if (oInsertionPoint.type === Syntax.AssignmentExpression) {
			if (node.name === "right") {
				oInsertionPoint.right = oNodeName;
			} else {
				return {
					modified: true,
					addDependency: true,
				}; // successfully handled, but do not remove dependency
			}
		} else if (oInsertionPoint.type === Syntax.NewExpression) {
			oInsertionPoint.callee = oNodeName;
		} else if (oInsertionPoint.type === Syntax.ConditionalExpression) {
			oInsertionPoint[node.name] = oNodeName;
		} else if (oInsertionPoint.type === Syntax.LogicalExpression) {
			oInsertionPoint[node.name] = oNodeName;
		} else if (oInsertionPoint.type === Syntax.UnaryExpression) {
			oInsertionPoint[node.name] = oNodeName;
		} else if (oInsertionPoint.type === Syntax.ReturnStatement) {
			oInsertionPoint[node.name] = oNodeName;
		} else if (oInsertionPoint.type === Syntax.Property) {
			oInsertionPoint[node.name] = oNodeName;
		} else if (Array.isArray(oInsertionPoint)) {
			oInsertionPoint[node.name] = oNodeName;
		} else {
			throw new Error(
				"ModuleFunction: insertion is of an unsupported type " +
					oInsertionPoint.type
			);
		}
	},
};

module.exports = replaceable;
