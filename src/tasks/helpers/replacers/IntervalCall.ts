import {Syntax} from "esprima";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";
import * as ESTree from "estree";

import {ASTVisitor} from "../../../util/ASTVisitor";

const builders = recast.types.builders;

function containsThis(ast) {
	const oVisitor = new ASTVisitor();
	let bContainsThis = false;
	oVisitor.visit(ast, {
		visitThisExpression() {
			bContainsThis = true;
		},
	});
	return bContainsThis;
}
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

			let bUnknownCase = false;
			let bHasParams = false;
			let aArrayToAdd = [];
			if (aArgs.length === 4) {
				if (aArgs[3].type === Syntax.ArrayExpression) {
					aArrayToAdd = aArgs[3].elements;
					bHasParams = true;
				} else {
					bUnknownCase = true;
				}
			}

			/**
			 * jQuery.sap.delayedCall(2000, this, function() {
			 *		MessageToast.show("UploadComplete event triggered.");
			 *	});
			 *
			 * becomes
			 *
			 * setInterval(function() {
			 *		MessageToast.show("UploadComplete event triggered.");
			 *	}.bind(this), 2000);
			 */

			if (
				!bUnknownCase &&
				aArgs[2] &&
				(aArgs[2].type === Syntax.FunctionExpression ||
					aArgs[2].type === Syntax.MemberExpression ||
					aArgs[2].type === Syntax.Identifier)
			) {
				const sText =
					"(function(){\n" +
					"	setInterval(fnMethod.bind(oObject), 0);\n" +
					"})";
				const oAst = recast.parse(sText);

				const oFunctionExpression = (
					oAst.program.body["0"] as ESTree.ExpressionStatement
				).expression as ESTree.FunctionExpression;
				const oNodeSetInterval = (
					oFunctionExpression.body.body[
						"0"
					] as ESTree.ExpressionStatement
				).expression as ESTree.CallExpression;
				oNodeSetInterval.arguments[1] = aArgs[0]; // iInterval

				const oInnerCallExpression = oNodeSetInterval.arguments[
					"0"
				] as ESTree.CallExpression;

				if (
					aArgs[1] &&
					aArgs[1].type === Syntax.ThisExpression &&
					aArgs[2].type === Syntax.FunctionExpression
				) {
					const bContainsThis = containsThis(aArgs[2]);
					if (bContainsThis) {
						oInnerCallExpression.arguments = []; // oObject
						oInnerCallExpression.arguments = [].concat(aArgs[1]);
					} else {
						oInnerCallExpression.arguments = []; // leave empty as this is not contained
					}
				} else {
					oInnerCallExpression.arguments = []; // oObject
					oInnerCallExpression.arguments = [].concat(aArgs[1]);
				}

				if (bHasParams) {
					oInnerCallExpression.arguments =
						oInnerCallExpression.arguments.concat(aArrayToAdd); // oObject
				}

				if (oInnerCallExpression.arguments.length > 0) {
					(
						oInnerCallExpression.callee as ESTree.MemberExpression
					).object = aArgs[2]; // fnMethod
				} else {
					// if bind has no arguments, leave it out
					oNodeSetInterval.arguments["0"] = aArgs[2]; // fnMethod
				}
				oInsertionPoint[node.parentPath.name] = oNodeSetInterval;
			} else if (
				!bUnknownCase &&
				aArgs[2] &&
				aArgs[2].type === Syntax.Literal
			) {
				/**
		* jQuery.sap.delayedCall(iInterval, this, "_resize", [a]);
		*
		* becomes
		*
		* setInterval(function(){
		  this["_resize"].apply([a]);
		}.bind(this), iInterval);
		*/

				const sText =
					"(function(){\n" +
					"	setInterval(oObject[fnMethod].bind(oObject), 0);\n" +
					"})";

				const oAst = recast.parse(sText);
				const oFunctionExpression = (
					oAst.program.body["0"] as ESTree.ExpressionStatement
				).expression as ESTree.FunctionExpression;
				const oNodeSetInterval = (
					oFunctionExpression.body.body[
						"0"
					] as ESTree.ExpressionStatement
				).expression as ESTree.CallExpression;

				// iInterval -> args 0

				oNodeSetInterval.arguments["1"] = aArgs[0];

				const oCallExpression = oNodeSetInterval.arguments[
					"0"
				] as ESTree.CallExpression;
				const oObjectCall = (
					oCallExpression.callee as ESTree.MemberExpression
				).object as ESTree.MemberExpression;

				// this -> args 1
				oObjectCall.object = aArgs[1];

				// function name (string)
				oObjectCall.property = aArgs[2];

				// this -> args 1
				oCallExpression.arguments = []; // oObject
				oCallExpression.arguments = [].concat(aArgs[1]); // oObject
				if (bHasParams) {
					oCallExpression.arguments =
						oCallExpression.arguments.concat(aArrayToAdd); // oObject
				}
				oInsertionPoint[node.parentPath.name] = oNodeSetInterval;
			} else if (aArgs[2]) {
				/**
		* if (jQuery.type(method) == "string") {
		method = oObject[method];
		}
		method.apply(oObject, aParameters || []);
		*/

				const sText =
					"(function () {\n" +
					"	setInterval(function () {\n" +
					"		var fnMethod = 0;\n" +
					'		if (typeof fnMethod === "string" || fnMethod instanceof String) {\n' +
					"			fnMethod = oObject[fnMethod];\n" +
					"		}\n" +
					"		fnMethod.apply();\n" +
					"	}.bind(oObject), 0);\n" +
					"})";

				const oAst = recast.parse(sText);
				const oIntervalExpressionStatement = oAst.program.body[
					"0"
				] as ESTree.ExpressionStatement;
				const oFnExpression =
					oIntervalExpressionStatement.expression as ESTree.FunctionExpression;
				const oInnerExpressionStatement = oFnExpression.body.body[
					"0"
				] as ESTree.ExpressionStatement;
				const oNodeSetInterval =
					oInnerExpressionStatement.expression as ESTree.CallExpression;
				const oFirstArgument = oNodeSetInterval.arguments[
					"0"
				] as ESTree.CallExpression;
				const oFirstArgumentCallee =
					oFirstArgument.callee as ESTree.MemberExpression;
				const oFirstArgumentCalleeFunctionExpression =
					oFirstArgumentCallee.object as ESTree.FunctionExpression;
				const oNodeSetIntervalBody =
					oFirstArgumentCalleeFunctionExpression.body.body;

				oNodeSetInterval.arguments[1] = aArgs[0]; // iInterval

				// aArgs[1] // oObject
				// aArgs[2] // fnMethod
				(
					oNodeSetIntervalBody["0"] as ESTree.VariableDeclaration
				).declarations["0"].init = aArgs[2];
				const blockStatement = (
					oNodeSetIntervalBody["1"] as ESTree.IfStatement
				).consequent as ESTree.BlockStatement;
				const assignment = (
					(blockStatement.body["0"] as ESTree.ExpressionStatement)
						.expression as ESTree.AssignmentExpression
				).right as ESTree.MemberExpression;
				assignment.object = aArgs[1];
				const oNodeMethodCall = oNodeSetIntervalBody[
					"2"
				] as ESTree.ExpressionStatement;
				const oCallExpression =
					oNodeMethodCall.expression as ESTree.CallExpression;
				const oMemberExpression =
					oCallExpression.callee as ESTree.MemberExpression;

				(oMemberExpression.object as ESTree.MemberExpression).property =
					aArgs[2];
				(oMemberExpression.object as ESTree.MemberExpression).object =
					aArgs[1];

				// check that bind argument is used (e.g. this arg)
				const bContainsThis =
					containsThis(aArgs[1]) ||
					containsThis(aArgs[2]) ||
					containsThis(aArgs[3]);

				if (bContainsThis) {
					oFirstArgument.arguments["0"] = builders.identifier("this");
				} else {
					oFirstArgument.arguments["0"] = aArgs[1];
				}

				oCallExpression.arguments = [];
				oCallExpression.arguments.push(aArgs[1]);
				if (aArgs.length > 3) {
					const argument = builders.logicalExpression(
						"||",
						aArgs[3],
						builders.arrayExpression([])
					);

					oCallExpression.arguments.push(argument);
				} else {
					oCallExpression.arguments.push(
						builders.arrayExpression([])
					);
				}
				oInsertionPoint[node.parentPath.name] = oNodeSetInterval;
			} else {
				throw new Error(
					"Failed to replace unknown IntervalCall. Cannot determine 3rd argument (neither string nor function)"
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
