import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
 * represents a module function which exposes itself as function
 * Module: encodeXML
 *
 * @param {recast.NodePath} node The top node of the module reference
 * @param {string} name The name of the new module
 * @param {string} fnName The name of the function inside the new module
 * @param {string} oldModuleCall The old import name
 * @param {object} config configuration
 * @returns {void}
 */
const replaceable: ASTReplaceable = {
	replace(
		node: NodePath,
		name: string,
		fnName: string,
		oldModuleCall: string,
		config: {objectProperty: string; comparisonValue: string}
	): void {
		const oNodeIdentifier: ESTree.Identifier = builders.identifier(name);
		let oNodeModule: ESTree.Expression = oNodeIdentifier;
		if (config.objectProperty) {
			oNodeModule = builders.memberExpression(
				oNodeIdentifier,
				builders.identifier(config.objectProperty)
			);
		}

		const oInsertionPoint = node.parentPath.value;
		const oInsertion = node.value;
		if (fnName) {
			oNodeModule = builders.memberExpression(
				oNodeModule,
				builders.identifier(fnName),
				false
			);
		}

		let oReplacement: ESTree.Expression = oNodeModule;
		if (config.comparisonValue) {
			oReplacement = builders.binaryExpression(
				"===",
				oReplacement,
				builders.literal(config.comparisonValue)
			);
		}

		switch (oInsertion.type) {
			case Syntax.MemberExpression:
				{
					// MyModule.myField
					oInsertionPoint[node.name] = oReplacement;
				}
				break;
			default: {
				throw new Error(
					"insertion is of type " +
						oInsertion.type +
						"(supported are only Call- and Member-Expressions)"
				);
			}
		}
	},
};

module.exports = replaceable;
