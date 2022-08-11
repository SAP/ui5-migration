import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
 * Returns the first parameter of the given call expression when the callee of the call expression matches one of the following
 * conditions:
 * <ul>
 * <li>jQuery(param)(</li>
 * <li>$(param)</li>
 * </ul>
 */
const findJQueryCreationParam = (oCallExpression: ESTree.CallExpression) => {
	const oCalleeObject = (oCallExpression.callee as ESTree.MemberExpression)
		.object;

	if (
		oCalleeObject.type === Syntax.CallExpression &&
		oCalleeObject.callee.type === Syntax.Identifier &&
		(oCalleeObject.callee.name === "$" ||
			oCalleeObject.callee.name.toLowerCase() === "jquery")
	) {
		return oCalleeObject.arguments[0];
	}

	return undefined;
};

const createParamsForNewCall = (
	oCallExpression: ESTree.CallExpression,
	oProperty: ESTree.Literal | ESTree.Identifier,
	oSecondParam?: ESTree.Literal
) => {
	const aParams = [];

	aParams.push(
		// check whether the param that is given to the jQuery constructor can be reused
		findJQueryCreationParam(oCallExpression) ||
			builders.memberExpression(
				(oCallExpression.callee as ESTree.MemberExpression)
					.object as ESTree.Expression,
				oProperty.type === Syntax.Literal
					? builders.literal(
							(oProperty as ESTree.Literal).value as string
					  )
					: builders.identifier(
							(oProperty as ESTree.Identifier).name
					  ),
				true
			)
	);

	if (oSecondParam) {
		aParams.push(
			builders.literal((oSecondParam as ESTree.Literal).value as boolean)
		);
	}
	return aParams;
};

/**
 * represents one of the following 2 cases which contains a jQuery.fn.control call
 *
 * <ul>
 * <li><code>expression.control(int, boolean?)</code></li>
 * <li><code>expression.control()[int]</code></li>
 * </ul>
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

		const oInsertionPoint = node.parentPath.value;

		let oCallExpression: ESTree.CallExpression;
		let oProperty: ESTree.Literal | ESTree.Identifier;
		let oSecondParam: ESTree.Literal;

		if (node.value.type === Syntax.CallExpression) {
			// CallExpression, for example xxx.control(0)
			oCallExpression = node.value;
			oProperty =
				oCallExpression.arguments[0].type === Syntax.Literal
					? (oCallExpression.arguments[0] as ESTree.Literal)
					: (oCallExpression.arguments[0] as ESTree.Identifier);
			oSecondParam =
				oCallExpression.arguments[1] &&
				(oCallExpression.arguments[1] as ESTree.Literal);
		} else if (node.value.type === Syntax.MemberExpression) {
			// MemberExpression, for example xxx.control()[0]
			oCallExpression = node.value.object as ESTree.CallExpression;
			oProperty =
				node.value.property.type === Syntax.Literal
					? (node.value.property as ESTree.Literal)
					: (node.value.property as ESTree.Identifier);
		}

		const aParams = createParamsForNewCall(
			oCallExpression,
			oProperty,
			oSecondParam
		);

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
