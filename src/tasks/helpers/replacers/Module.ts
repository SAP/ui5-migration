import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

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
		oldModuleCall: string
	): void {
		const oInsertionPoint = node.parentPath.value;
		let oNodeModule: ESTree.Expression = builders.identifier(name);
		if (fnName) {
			oNodeModule = builders.memberExpression(
				oNodeModule,
				builders.identifier(fnName),
				false
			);
		}

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
			default:
				throw new Error(
					"Module: insertion is of an unsupported type " +
						oInsertionPoint.type
				);
		}
	},
};

module.exports = replaceable;
