import {Syntax} from "../../../Migration";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
 * Replace
 * - sap.ui.getCore().byId(ID)
 * - oCore.byId(ID)
 *
 * With
 *  Element.registry.get(ID)
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
		oldModuleCall: string,
		config: {newVariableName: string} //config object
	): void {
		const oObjectIdent: ESTree.Identifier = builders.identifier(
			name || config.newVariableName
		);

		const oInsertionPoint = node.parentPath.value;

		const oCallExpression = node.value as ESTree.CallExpression;

		const aArgs = oCallExpression.arguments.slice();

		const oNodeModule: ESTree.Expression = builders.callExpression(
			builders.memberExpression(
				builders.memberExpression(
					oObjectIdent,
					builders.identifier("registry")
				),
				builders.identifier("get")
			),
			aArgs
		);

		// arrays do not have a type
		if (Array.isArray(oInsertionPoint)) {
			oInsertionPoint[node.name] = oNodeModule;
			return;
		}

		switch (oInsertionPoint.type) {
			case Syntax.CallExpression: // MyModule.myFunction()
				oInsertionPoint.callee = oNodeModule;
				break;
			case Syntax.NewExpression: // new MyModule.myFunction()
				oInsertionPoint.callee = oNodeModule;
				break;
			case Syntax.MemberExpression: // MyModule.myField
				oInsertionPoint.object = oNodeModule;
				break;
			case Syntax.LogicalExpression: // value1 && MyModule.myField
				oInsertionPoint[node.name] = oNodeModule;
				break;
			case Syntax.UnaryExpression: // !MyModule.myField
				oInsertionPoint.argument = oNodeModule;
				break;
			case Syntax.VariableDeclarator: // var test = MyModule.myField
				oInsertionPoint.init = oNodeModule;
				break;
			case Syntax.AssignmentExpression: // test = MyModule.myField
				oInsertionPoint.right = oNodeModule;
				break;
			case Syntax.BinaryExpression: // var1 + MyModule.myField
				oInsertionPoint[node.name] = oNodeModule;
				break;
			case Syntax.ReturnStatement: // return MyModule.myField
				oInsertionPoint[node.name] = oNodeModule;
				break;
			case Syntax.ExpressionStatement:
				oInsertionPoint[node.name] = oNodeModule;
				break;
			case Syntax.IfStatement:
				oInsertionPoint[node.name] = oNodeModule;
				break;
			case Syntax.ConditionalExpression:
				oInsertionPoint[node.name] = oNodeModule;
				break;
			case Syntax.Property:
				oInsertionPoint[node.name] = oNodeModule;
				break;
			default:
				throw new Error(
					"Module: insertion is of an unsupported type " +
						oInsertionPoint.type
				);
		}
	},
};

module.exports = replaceable;
