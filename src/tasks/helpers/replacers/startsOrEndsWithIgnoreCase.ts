import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

function isString(node: ESTree.Node) {
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

function isWithinIfStatement(node: NodePath) {
	while (node.parentPath && node.parentPath.value) {
		if (node.parentPath.value.type === Syntax.IfStatement) {
			return true;
		}
		node = node.parentPath;
	}
	return false;
}

/**
 * Replaces the existing call of <code>jQuery.sap.endsWithIgnoreCase(value,
 * pattern)</code> with
 * <code>value.toLowerCase().endsWith(pattern.toLowerCase())</code>. Also
 * replaces the existing call of <code>jQuery.sap.startsWithIgnoreCase(value,
 * pattern)</code> with
 * <code>value.toLowerCase().startsWith(pattern.toLowerCase())</code> The
 * parameter config.startsOrEndsWithFunction is used to switch between the
 * replacements.
 *
 * @param {recast.NodePath} node The top node of the module reference
 * @param {string} name The name of the new module
 * @param {string} fnName The name of the function inside the new module
 * @param {string} oldModuleCall The old import name
 * @param {object} config Custom config parameters
 * @param {string} config.startsOrEndsWithFunction Function name to switch between replacement of startsWith or endsWith
 * @returns {void}
 */
const replaceable: ASTReplaceable = {
	replace(
		node: NodePath,
		name: string,
		fnName: string,
		oldModuleCall: string,
		config: {startsOrEndsWithFunction: string}
	): void {
		if (!config.startsOrEndsWithFunction) {
			throw Error("Function name not set.");
		}
		if (
			config.startsOrEndsWithFunction !== "startsWith" &&
			config.startsOrEndsWithFunction !== "endsWith"
		) {
			throw Error(
				config.startsOrEndsWithFunction +
					" is not a valid function for startsOrEndsWithIgnoreCase"
			);
		}

		const oInsertionPoint = node.parentPath.parentPath.value;
		const oInsertion = node.parentPath.value;
		let oReplacement = null;

		if (oInsertion.type === Syntax.CallExpression) {
			const aArgs = oInsertion.arguments;
			const oValue = aArgs[0] as ESTree.Expression;
			const oPattern = aArgs[1] as ESTree.Expression;

			// Build replacement
			let oCallExpressiontoLowerCase;
			if (oValue.type === Syntax.Literal && oValue.value) {
				oCallExpressiontoLowerCase = builders.literal(
					oValue.value.toString().toLowerCase()
				);
			} else {
				const oMemberExpressiontoLowerCaseForValue =
					builders.memberExpression(
						oValue,
						builders.identifier("toLowerCase")
					);
				oCallExpressiontoLowerCase = builders.callExpression(
					oMemberExpressiontoLowerCaseForValue,
					[]
				);
			}

			const oMemberExpressionStartsOrEndsWith = builders.memberExpression(
				oCallExpressiontoLowerCase,
				builders.identifier(config.startsOrEndsWithFunction)
			);

			let oCallExpressiontoLowerCaseForPattern;
			if (oPattern.type === Syntax.Literal && oPattern.value) {
				oCallExpressiontoLowerCaseForPattern = builders.literal(
					oPattern.value.toString().toLowerCase()
				);
			} else {
				const oMemberExpressiontoLowerCaseForPattern =
					builders.memberExpression(
						oPattern,
						builders.identifier("toLowerCase")
					);
				oCallExpressiontoLowerCaseForPattern = builders.callExpression(
					oMemberExpressiontoLowerCaseForPattern,
					[]
				);
			}

			const replacementCallExpression = builders.callExpression(
				oMemberExpressionStartsOrEndsWith,
				[oCallExpressiontoLowerCaseForPattern]
			);

			// Ternary check for pattern
			if (oPattern.type === Syntax.Literal) {
				oReplacement = replacementCallExpression;
			} else if (
				oPattern.type === Syntax.CallExpression &&
				isString(oPattern.callee)
			) {
				oReplacement = builders.logicalExpression(
					"&&",
					oPattern,
					replacementCallExpression
				);
			} else {
				const typeOfUnaryExpression = builders.unaryExpression(
					"typeof",
					oPattern,
					true
				);
				const typeOfStringBinaryExpression = builders.binaryExpression(
					"==",
					typeOfUnaryExpression,
					builders.literal("string")
				);
				const typeOfStringAndExistenceLogicalExpression =
					builders.logicalExpression(
						"&&",
						typeOfStringBinaryExpression,
						oPattern
					);

				// check if we are within an if expression
				if (isWithinIfStatement(node)) {
					// if ( typeof s == "string" && s && s.startsWith(x) ) {...}
					oReplacement = builders.logicalExpression(
						"&&",
						typeOfStringAndExistenceLogicalExpression,
						replacementCallExpression
					);
				} else {
					// var xx = (typeof s == "string" && s) ? s.startsWith(x) :
					// false );
					oReplacement = builders.conditionalExpression(
						typeOfStringAndExistenceLogicalExpression,
						replacementCallExpression,
						builders.literal(false)
					);
				}
			}

			// Add Replacement
			oInsertionPoint[node.parentPath.name] = oReplacement;
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
