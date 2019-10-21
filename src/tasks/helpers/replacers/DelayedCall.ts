import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, ASTReplaceableResult, NodePath} from "ui5-migration";

import {ASTVisitor} from "../../../util/ASTVisitor";

const builders = recast.types.builders;

function containsThis(ast: ESTree.Node) {
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
			 * setTimeout(function() {
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
					"	setTimeout(fnMethod.bind(oObject), 0);\n" +
					"})";
				const oAst = recast.parse(sText);

				const oNodeSetTimeout = getInnerExpression(oAst.program);
				oNodeSetTimeout.arguments[1] = aArgs[0]; // iDelay

				if (
					aArgs[1] &&
					aArgs[1].type === Syntax.ThisExpression &&
					aArgs[2].type === Syntax.FunctionExpression
				) {
					const bContainsThis = containsThis(aArgs[2]);
					if (bContainsThis) {
						oNodeSetTimeout.arguments["0"].arguments = []; // oObject
						oNodeSetTimeout.arguments["0"].arguments = [].concat(
							aArgs[1]
						);
					} else {
						oNodeSetTimeout.arguments["0"].arguments = []; // leave empty as this is not contained
					}
				} else {
					oNodeSetTimeout.arguments["0"].arguments = []; // oObject
					oNodeSetTimeout.arguments["0"].arguments = [].concat(
						aArgs[1]
					);
				}

				if (bHasParams) {
					oNodeSetTimeout.arguments[
						"0"
					].arguments = oNodeSetTimeout.arguments[
						"0"
					].arguments.concat(aArrayToAdd); // oObject
				}

				if (oNodeSetTimeout.arguments["0"].arguments.length > 0) {
					oNodeSetTimeout.arguments["0"].callee.object = aArgs[2]; // fnMethod
				} else {
					// if bind has no arguments, leave it out
					oNodeSetTimeout.arguments["0"] = aArgs[2]; // fnMethod
				}
				oInsertionPoint[node.parentPath.name] = oNodeSetTimeout;
			} else if (
				!bUnknownCase &&
				aArgs[2] &&
				aArgs[2].type === Syntax.Literal
			) {
				/**
		* jQuery.sap.delayedCall(iDelay, this, "_resize", [a]);
		*
		* becomes
		*
		* setTimeout(function(){
		  this["_resize"].apply([a]);
		}.bind(this), iDelay);
		*/

				const sText =
					"(function(){\n" +
					"	setTimeout(oObject[fnMethod].bind(oObject), 0);\n" +
					"})";

				const oAst = recast.parse(sText);
				const oNodeSetTimeout = getInnerExpression(oAst.program);

				// iDelay -> args 0

				oNodeSetTimeout.arguments["1"] = aArgs[0];

				const oObjectCall = ((oNodeSetTimeout.arguments[
					"0"
				] as ESTree.CallExpression).callee as ESTree.MemberExpression)
					.object as ESTree.MemberExpression;

				// this -> args 1
				oObjectCall.object = aArgs[1];

				// function name (string)
				oObjectCall.property = aArgs[2];

				// this -> args 1
				oNodeSetTimeout.arguments["0"].arguments = []; // oObject
				oNodeSetTimeout.arguments["0"].arguments = [].concat(aArgs[1]); // oObject
				if (bHasParams) {
					oNodeSetTimeout.arguments[
						"0"
					].arguments = oNodeSetTimeout.arguments[
						"0"
					].arguments.concat(aArrayToAdd); // oObject
				}
				oInsertionPoint[node.parentPath.name] = oNodeSetTimeout;
			} else if (aArgs[2]) {
				/**
		* if (jQuery.type(method) == "string") {
		method = oObject[method];
		}
		method.apply(oObject, aParameters || []);
		*/

				const sText =
					"(function () {\n" +
					"	setTimeout(function () {\n" +
					"		var fnMethod = 0;\n" +
					'		if (typeof fnMethod === "string" || fnMethod instanceof String) {\n' +
					"			fnMethod = oObject[fnMethod];\n" +
					"		}\n" +
					"		fnMethod.apply();\n" +
					"	}.bind(oObject), 0);\n" +
					"})";

				const oAst = recast.parse(sText);
				const oNodeSetTimeout = getInnerExpression(oAst.program);
				const oNodeSetTimeoutBody =
					oNodeSetTimeout.arguments["0"].callee.object.body.body;

				oNodeSetTimeout.arguments[1] = aArgs[0]; // iDelay

				// aArgs[1] // oObject
				// aArgs[2] // fnMethod
				oNodeSetTimeoutBody["0"].declarations["0"].init = aArgs[2];
				oNodeSetTimeoutBody["1"].consequent.body[
					"0"
				].expression.right.object = aArgs[1];
				const oNodeMethodCall = oNodeSetTimeoutBody["2"];
				oNodeMethodCall.expression.callee.object.property = aArgs[2];
				oNodeMethodCall.expression.callee.object.object = aArgs[1];

				// check that bind argument is used (e.g. this arg)
				const bContainsThis =
					containsThis(aArgs[1]) ||
					containsThis(aArgs[2]) ||
					containsThis(aArgs[3]);

				if (bContainsThis) {
					oNodeSetTimeout.arguments["0"].arguments[
						"0"
					] = builders.identifier("this");
				} else {
					oNodeSetTimeout.arguments["0"].arguments["0"] = aArgs[1];
				}

				oNodeMethodCall.expression.arguments = [];
				oNodeMethodCall.expression.arguments.push(aArgs[1]);
				if (aArgs.length > 3) {
					const argument = builders.logicalExpression(
						"||",
						aArgs[3],
						builders.arrayExpression([])
					);

					oNodeMethodCall.expression.arguments.push(argument);
				} else {
					oNodeMethodCall.expression.arguments.push(
						builders.arrayExpression([])
					);
				}
				oInsertionPoint[node.parentPath.name] = getInnerExpression(
					oAst.program
				);
			} else {
				throw new Error(
					"Failed to replace unknown DelayedCall. Cannot determine 3rd argument (neither string nor function)"
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
