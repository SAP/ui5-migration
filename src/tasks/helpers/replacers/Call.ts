import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
 * Creates a call expression as replacement
 * Module: log
 * Functions: info
 * Old Arguments: [1, 2]
 *
 * --> will create call: Log.info(1, 2)
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
		oldModuleCall: string,
		config: {newArgs: string[]}
	): void {
		const oInsertionPoint = node.parentPath.value;
		let oNewCall: ESTree.Expression = builders.identifier(name);
		if (fnName) {
			oNewCall = builders.memberExpression(
				oNewCall,
				builders.identifier(fnName),
				false
			);
		}

		let args = [];
		if (config.newArgs) {
			args = config.newArgs.map(oEle => {
				return evaluateExpressions(oEle);
			});
		} else if (
			node.value.type === Syntax.NewExpression ||
			node.value.type === Syntax.CallExpression
		) {
			args = node.value.arguments;
		}

		oNewCall = builders.callExpression(oNewCall, args);

		// arrays do not have a type
		if (Array.isArray(oInsertionPoint)) {
			oInsertionPoint[node.name] = oNewCall;
			return;
		}

		switch (oInsertionPoint.type) {
			case Syntax.CallExpression: // MyModule.myFunction()
				oInsertionPoint.callee = oNewCall;
				break;
			case Syntax.NewExpression: // new MyModule.myFunction()
				oInsertionPoint.callee = oNewCall;
				break;
			case Syntax.MemberExpression: // MyModule.myField
				oInsertionPoint.object = oNewCall;
				break;
			case Syntax.LogicalExpression: // value1 && MyModule.myField
				oInsertionPoint[node.name] = oNewCall;
				break;
			case Syntax.UnaryExpression: // !MyModule.myField
				oInsertionPoint.argument = oNewCall;
				break;
			case Syntax.VariableDeclarator: // var test = MyModule.myField
				oInsertionPoint.init = oNewCall;
				break;
			case Syntax.AssignmentExpression: // test = MyModule.myField
				oInsertionPoint.right = oNewCall;
				break;
			case Syntax.BinaryExpression: // var1 + MyModule.myField
				oInsertionPoint[node.name] = oNewCall;
				break;
			case Syntax.ReturnStatement: // return MyModule.myField
				oInsertionPoint[node.name] = oNewCall;
				break;
			case Syntax.ExpressionStatement: // MyModule.myFunction()
				oInsertionPoint[node.name] = oNewCall;
				break;
			default:
				throw new Error(
					"Module: insertion is of an unsupported type " +
						oInsertionPoint.type
				);
		}
	},
};

function evaluateExpressions(parameter) {
	const expressionStatement = recast.parse(parameter).program.body[
		"0"
	] as ESTree.ExpressionStatement;
	return expressionStatement.expression;
}

module.exports = replaceable;
