import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

import {hasConstantValue} from "../../../util/ASTUtils";

const builders = recast.types.builders;

function isString(node) {
	return (
		node.type === Syntax.MemberExpression &&
		node.property.type === Syntax.Identifier &&
		(node.property.name === "toLowerCase" ||
			node.property.name === "toLocaleLowerCase" ||
			node.property.name === "toUpperCase" ||
			node.property.name === "toLocaleUpperCase" ||
			node.property.name === "substring" ||
			node.property.name === "substr" ||
			node.property.name === "trim" ||
			node.property.name === "toString")
	);
}
/**
 * represents a module which exposes several functions such as
 * Module: log
 * Functions: warning, info
 *
 * @param {NodePath.NodePath} node The top node of the module reference
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

		// CallExpression
		// MyModule.myFunction()
		let bReplaced = false;
		if (oInsertionPoint.type === Syntax.CallExpression) {
			const aArgs = oInsertionPoint.arguments;
			const name = aArgs[0] as ESTree.Expression;
			const newCallee = builders.memberExpression(
				name,
				builders.identifier(fnName),
				false
			);
			const arg = aArgs[1] as ESTree.Expression;
			if (arg && arg.type === Syntax.Literal) {
				if (typeof arg.value === "string" && arg.value.length > 0) {
					oInsertionPoint.callee = newCallee;
					oInsertionPoint.arguments = aArgs.splice(1);
					bReplaced = true;
				}
			} else if (arg && hasConstantValue(arg)) {
				const oNewExpression = builders.logicalExpression(
					"&&",
					builders.logicalExpression(
						"&&",
						builders.binaryExpression(
							"==",
							builders.unaryExpression("typeof", arg),
							builders.literal("string")
						),
						builders.binaryExpression(
							">",
							builders.memberExpression(
								arg,
								builders.identifier("length")
							),
							builders.literal(0)
						)
					),
					oInsertionPoint
				);

				oInsertionPoint.callee = newCallee;
				oInsertionPoint.arguments = aArgs.splice(1);
				oNodeParent.parentPath.value[oNodeParent.name] = oNewExpression;
				bReplaced = true;
			} else if (
				arg &&
				arg.type === Syntax.CallExpression &&
				isString(arg.callee)
			) {
				oInsertionPoint.callee = newCallee;
				oInsertionPoint.arguments = aArgs.splice(1);
				bReplaced = true;
			}

			// MemberExpression
			// MyModule.myField
		}
		if (!bReplaced) {
			throw new Error(
				"insertion is of type " +
					oInsertionPoint.type +
					"(supported are only Call-Expressions)"
			);
		}
	},
};

module.exports = replaceable;
