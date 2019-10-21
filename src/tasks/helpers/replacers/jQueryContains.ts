import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, ASTReplaceableResult, NodePath} from "ui5-migration";
const execModule = require("./Module");

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

/**
 * Checks arguments if a replacement with Object.assign can be performed
 *
 * @param args arguments of the jQuery.extend call
 * @returns {boolean} whether or not an Object assign replacement can be performed.
 */
function canReplaceWithObjectAssign(
	args: Array<ESTree.Expression | ESTree.SpreadElement>
) {
	/*
	 * Checks if the first argument is an empty object expression, in this case
	 * it can always be replaced. Because even though second argument could
	 * contain undefined values but they won't overwrite anything.
	 * @example
	 * jQuery.extend({}, myObject)
	 */
	if (
		args.length === 2 &&
		args[0].type === Syntax.ObjectExpression &&
		emptyObjectExpression(args[0] as ESTree.ObjectExpression)
	) {
		return true;
		/*
		 * Checks if all arguments are object expressions and that no value is
		 * undefined
		 * @example
		 * jQuery.extend({foo: 1}, {bar: 2})
		 */
	} else if (args.every(arg => arg.type === Syntax.ObjectExpression)) {
		return objectExpressionsWithoutUndefinedValues(
			args as ESTree.ObjectExpression[]
		);
	}
	return false;
}

/**
 * @param {ESTree.ObjectExpression} objectExpression
 * @returns {boolean} whether or not the given object expression is empty (does not contain any key/values).
 */
function emptyObjectExpression(objectExpression: ESTree.ObjectExpression) {
	return objectExpression.properties.length === 0;
}

/**
 * @param {ESTree.ObjectExpression[]} objectExpressions
 * @returns {boolean} whether or not all object expressions have only valid values (no undefined values).
 */
function objectExpressionsWithoutUndefinedValues(
	objectExpressions: ESTree.ObjectExpression[]
) {
	return objectExpressions.every(objectExpression => {
		return objectExpressionWithoutUndefinedValues(objectExpression);
	});
}

/**
 * @param {ESTree.ObjectExpression} objectExpression
 * @returns {boolean} whether or not the given object expression has only valid values (no undefined values).
 */
function objectExpressionWithoutUndefinedValues(
	objectExpression: ESTree.ObjectExpression
) {
	return objectExpression.properties.every(prop => {
		return !(
			prop.value.type === Syntax.Identifier &&
			(prop.value as ESTree.Identifier).name === "undefined"
		);
	});
}

module.exports = replaceable;
