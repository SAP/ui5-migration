import {Syntax} from "esprima";
import * as recast from "recast";
import * as ESTree from "estree";
import {ASTReplaceable, NodePath} from "ui5-migration";

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

function getInnerExpression(program: ESTree.Program): ESTree.CallExpression {
	const expr = program.body["0"] as ESTree.ExpressionStatement;
	const funcExp = expr.expression as ESTree.FunctionExpression;
	const body = funcExp.body as ESTree.BlockStatement;
	const body0 = body.body["0"] as ESTree.ExpressionStatement;
	return body0.expression as ESTree.CallExpression;
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

				const oNodeSetInterval = getInnerExpression(oAst.program);
				oNodeSetInterval.arguments[1] = aArgs[0]; // iInterval

				let oNodeArguments = oNodeSetInterval.arguments[
					"0"
				] as ESTree.CallExpression;

				if (
					aArgs[1] &&
					aArgs[1].type === Syntax.ThisExpression &&
					aArgs[2].type === Syntax.FunctionExpression
				) {
					const bContainsThis = containsThis(aArgs[2]);
					if (bContainsThis) {
						oNodeArguments.arguments = []; // oObject
						oNodeArguments.arguments = [].concat(aArgs[1]);
					} else {
						oNodeArguments.arguments = []; // leave empty as this is not contained
					}
				} else {
					oNodeArguments.arguments = []; // oObject
					oNodeArguments.arguments = [].concat(aArgs[1]);
				}

				if (bHasParams) {
					oNodeArguments.arguments =
						oNodeArguments.arguments.concat(aArrayToAdd); // oObject
				}

				if (oNodeArguments.arguments.length > 0) {
					(oNodeArguments.callee as ESTree.MemberExpression).object =
						aArgs[2]; // fnMethod
				} else {
					// if bind has no arguments, leave it out
					oNodeArguments = aArgs[2]; // fnMethod
				}
				oNodeSetInterval.arguments["0"] = oNodeArguments;
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
				const oNodeSetInterval = getInnerExpression(oAst.program);

				const oNodeArguments = oNodeSetInterval.arguments[
					"0"
				] as ESTree.CallExpression;

				// iInterval -> args 0

				oNodeSetInterval.arguments["1"] = aArgs[0];

				const oObjectCall = (
					oNodeArguments.callee as ESTree.MemberExpression
				).object as ESTree.MemberExpression;

				// this -> args 1
				oObjectCall.object = aArgs[1];

				// function name (string)
				oObjectCall.property = aArgs[2];

				// this -> args 1
				oNodeArguments.arguments = []; // oObject
				oNodeArguments.arguments = [].concat(aArgs[1]); // oObject
				if (bHasParams) {
					oNodeArguments.arguments =
						oNodeArguments.arguments.concat(aArrayToAdd); // oObject
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
				const oNodeSetInterval = getInnerExpression(oAst.program);
				const oNodeArguments = oNodeSetInterval.arguments[
					"0"
				] as ESTree.CallExpression;

				const oNodeSetIntervalBody = (
					(oNodeArguments.callee as ESTree.MemberExpression)
						.object as ESTree.FunctionExpression
				).body.body;

				oNodeSetInterval.arguments[1] = aArgs[0]; // iInterval

				// aArgs[1] // oObject
				// aArgs[2] // fnMethod
				(
					oNodeSetIntervalBody["0"] as ESTree.VariableDeclaration
				).declarations["0"].init = aArgs[2];
				(
					(
						(
							(
								(
									oNodeSetIntervalBody[
										"1"
									] as ESTree.IfStatement
								).consequent as ESTree.BlockStatement
							).body["0"] as ESTree.ExpressionStatement
						).expression as ESTree.AssignmentExpression
					).right as ESTree.MemberExpression
				).object = aArgs[1];
				const oNodeMethodCall = oNodeSetIntervalBody[
					"2"
				] as ESTree.ExpressionStatement;
				const oNodeMethodCallExpression =
					oNodeMethodCall.expression as ESTree.CallExpression;
				(
					(
						oNodeMethodCallExpression.callee as ESTree.MemberExpression
					).object as ESTree.MemberExpression
				).property = aArgs[2];
				(
					(
						oNodeMethodCallExpression.callee as ESTree.MemberExpression
					).object as ESTree.MemberExpression
				).object = aArgs[1];

				// check that bind argument is used (e.g. this arg)
				const bContainsThis =
					containsThis(aArgs[1]) ||
					containsThis(aArgs[2]) ||
					containsThis(aArgs[3]);

				if (bContainsThis) {
					oNodeArguments.arguments["0"] = builders.identifier("this");
				} else {
					oNodeArguments.arguments["0"] = aArgs[1];
				}

				oNodeMethodCallExpression.arguments = [];
				oNodeMethodCallExpression.arguments.push(aArgs[1]);
				if (aArgs.length > 3) {
					const argument = builders.logicalExpression(
						"||",
						aArgs[3],
						builders.arrayExpression([])
					);

					oNodeMethodCallExpression.arguments.push(argument);
				} else {
					oNodeMethodCallExpression.arguments.push(
						builders.arrayExpression([])
					);
				}
				oInsertionPoint[node.parentPath.name] = oNodeSetInterval;
			} else {
				throw new Error(
					"Failed to replace unknown IntervaledCall. Cannot determine 3rd argument (neither string nor function)"
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
