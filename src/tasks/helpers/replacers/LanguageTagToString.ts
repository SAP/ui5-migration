import {Syntax} from "esprima";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
 * Creates a call expression as replacement
 *
 * Formatting.getLanguageTag().toString()
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
		config: {}
	): void {
		const oInsertionPoint = node.parentPath.value;
		const oNewCall = builders.callExpression(
			builders.memberExpression(
				builders.callExpression(
					builders.memberExpression(
						builders.identifier(name),
						builders.identifier("getLanguageTag"),
						false
					),
					[]
				),
				builders.identifier("toString"),
				false
			),
			[]
		);

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
			case Syntax.ExpressionStatement:
				oInsertionPoint[node.name] = oNewCall;
				break;
			case Syntax.IfStatement:
				oInsertionPoint[node.name] = oNewCall;
				break;
			case Syntax.ConditionalExpression:
				oInsertionPoint[node.name] = oNewCall;
				break;
			case Syntax.Property:
				oInsertionPoint[node.name] = oNewCall;
				break;
			default:
				throw new Error(
					"Replacer Call: insertion is of an unsupported type " +
						oInsertionPoint.type
				);
		}
	},
};

module.exports = replaceable;
