import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;
/**
 *
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

			/**
			 * jQuery.sap.setObject(sName, vValue, oContext)
			 *
			 * before
			 * jQuery.sap.setObject("my.super.duper.test", {a: 5}, oContext)
			 *
			 * after
			 * * getObject(oContext, "my.super.duper.test", true).module = {a:
			 * 5};
			 *
			 * before
			 * jQuery.sap.setObject("my", {a: 7}, oContext)
			 *
			 * after
			 * * oContext["my"] = {a: 7};
			 */

			let oContext: ESTree.Expression = builders.identifier("window");

			if (aArgs.length > 2) {
				oContext = aArgs[2];
			}

			if (aArgs.length > 1) {
				const oArgument = aArgs[0];
				if (oArgument && oArgument.type === Syntax.Literal) {
					const aNames = oArgument.value.split(".");
					let oLeft;
					if (aNames.length > 1) {
						const sObjName = aNames.pop();
						const aGetObjectArguments = [];
						aGetObjectArguments.push(oContext);
						aGetObjectArguments.push(
							builders.literal(aNames.join("."))
						);
						aGetObjectArguments.push(builders.identifier("true"));
						oLeft = builders.memberExpression(
							builders.callExpression(
								builders.identifier(name),
								aGetObjectArguments
							),
							builders.identifier(sObjName)
						);
					} else if (aNames.length === 1) {
						oLeft = builders.memberExpression(oContext, oArgument);
					} else {
						oInsertionPoint[node.parentPath.name] = undefined;
					}
					if (oLeft) {
						const assi = builders.assignmentExpression(
							"=",
							oLeft,
							aArgs[1]
						);

						oInsertionPoint[node.parentPath.name] = assi;
					}
				} else {
					throw new Error(
						"Failed to replace setObject. First parameter must be a literal"
					);
				}
			} else {
				throw new Error(
					"Failed to replace setObject. Cannot determine 2nd or 3rd parameter"
				);
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
