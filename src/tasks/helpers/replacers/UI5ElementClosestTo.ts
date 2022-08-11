import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

type ParamArrayClosestTo = [ESTree.MemberExpression?, ESTree.Literal?];

/**
 * represents a module which exposes several functions such as
 * Module: log
 * Functions: warning, info
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
		const ui5elementIdent: ESTree.Identifier = builders.identifier(
			name || config.newVariableName
		);
		const ui5clostestIdent: ESTree.Identifier =
			builders.identifier("closestTo"); //TODO: consider use config as well
		const aParams: ParamArrayClosestTo = [];
		const oInsertionPoint = node.parentPath.value;

		if (node.value.type === Syntax.CallExpression) {
			// either CallExpression
			// .control(0)
			let oParam1: ESTree.MemberExpression;
			if (node.value.arguments[0].type === Syntax.Literal) {
				oParam1 = builders.memberExpression(
					(node.value.callee as ESTree.MemberExpression)
						.object as ESTree.Expression,
					builders.literal(
						(node.value.arguments[0] as ESTree.Literal)
							.value as string
					)
				);
			} else {
				// Identifier
				oParam1 = builders.memberExpression(
					(node.value.callee as ESTree.MemberExpression)
						.object as ESTree.Expression,
					builders.identifier(
						(node.value.arguments[0] as ESTree.Identifier).name
					),
					true
				);
			}
			aParams.push(oParam1);

			if (node.value.arguments[1]) {
				aParams.push(
					builders.literal(
						(node.value.arguments[1] as ESTree.Literal)
							.value as boolean
					)
				);
			}
		} else if (node.value.type === Syntax.MemberExpression) {
			// or MemberExpression
			// .control()[0]
			let oParam1: ESTree.MemberExpression;
			const callExpression = node.value.object as ESTree.CallExpression;
			if (node.value.property.type === Syntax.Literal) {
				oParam1 = builders.memberExpression(
					(callExpression.callee as ESTree.MemberExpression)
						.object as ESTree.Expression,
					builders.literal(
						(node.value.property as ESTree.Literal).value as string
					)
				);
			} else {
				oParam1 = builders.memberExpression(
					(callExpression.callee as ESTree.MemberExpression)
						.object as ESTree.Expression,
					builders.identifier(
						(node.value.property as ESTree.Identifier).name
					),
					true
				);
			}

			aParams.push(oParam1);
		}

		const oNodeModule: ESTree.Expression = builders.callExpression(
			builders.memberExpression(ui5elementIdent, ui5clostestIdent),
			aParams
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
			default:
				throw new Error(
					"Module: insertion is of an unsupported type " +
						oInsertionPoint.type
				);
		}
	},
};

module.exports = replaceable;
