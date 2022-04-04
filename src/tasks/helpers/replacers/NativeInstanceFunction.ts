import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";

import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

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
		if (oInsertionPoint.type === Syntax.CallExpression) {
			const aArgs = oInsertionPoint.arguments;
			const name = aArgs[0] as ESTree.Expression;
			const newCallee = builders.memberExpression(
				name,
				builders.identifier(fnName),
				false
			);
			oInsertionPoint.callee = newCallee;
			oInsertionPoint.arguments = aArgs.splice(1);
			// MemberExpression
			// MyModule.myField
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
