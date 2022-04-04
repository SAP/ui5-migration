import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, ASTReplaceableResult, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
 * Replaces jQuery.extend with either Object.assign or jQuery.extend.
 * An Object assign replacement can only be performed if there are no undefined
 * values overwriting "valid" values. Because jQuery.extend ignores undefined
 * values while Object.assign overwrites values
 *
 * @example difference between jQuery.extend and Object.assign (won't get
 * replaced)
 * jQuery.extend({a:3}, {a:undefined}); // {a:3}
 * Object.assign({a:3}, {a:undefined}); // {a:undefined}
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
			oInsertionPoint.arguments.length === 2
		) {
			const ident0 = oInsertionPoint.arguments[0] as ESTree.Identifier;
			const ident1 = oInsertionPoint.arguments[1] as ESTree.Identifier;
			const containsCall = builders.memberExpression(
				ident0,
				builders.identifier("contains"),
				false
			);

			const oNodeModule: ESTree.Expression = builders.logicalExpression(
				"&&",
				builders.binaryExpression("!==", ident0, ident1),
				builders.callExpression(containsCall, [ident1])
			);
			oActualInsertionPoint[node.parentPath.name] = oNodeModule;
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
