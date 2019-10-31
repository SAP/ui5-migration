import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
 * Uses function #fromURL with a logical or expression if there is one parameter otherwise uses functionParameter
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
		config: {functionParameter: string}
	): void {
		const oInsertionPoint = node.parentPath.parentPath.value;
		const oInsertion = node.parentPath.value;

		// CallExpression
		let bReplaced = false;
		if (oInsertion.type === Syntax.CallExpression) {
			const oldArgs = oInsertion.arguments;
			const newArgs = [];
			if (oldArgs.length === 0) {
				if (config.functionParameter) {
					const oAst = recast.parse(config.functionParameter).program
						.body["0"].expression;
					newArgs.push(oAst);
				}
			} else if (oldArgs.length === 1) {
				if (config.functionParameter) {
					const args: ESTree.Expression = recast.parse(
						config.functionParameter
					).program.body["0"].expression;
					const oFirstArg = oldArgs[0] as ESTree.Expression;
					const oLogicalExpression = builders.logicalExpression(
						"||",
						oFirstArg,
						args
					);
					newArgs.push(oLogicalExpression);
				} else {
					newArgs.push(oldArgs[0]);
				}
			}
			if (oldArgs.length < 2) {
				let oNodeModule: ESTree.Expression = builders.identifier(name);
				if (fnName) {
					oNodeModule = builders.memberExpression(
						oNodeModule,
						builders.identifier(fnName),
						false
					);
				}
				oInsertionPoint[node.parentPath.name] = builders.callExpression(
					oNodeModule,
					newArgs
				);
				bReplaced = true;
			}
		}
		if (!bReplaced) {
			throw new Error(
				"insertion is of type " +
					oInsertion.type +
					"(supported are only Call- and Member-Expressions)"
			);
		}
	},
};

module.exports = replaceable;
