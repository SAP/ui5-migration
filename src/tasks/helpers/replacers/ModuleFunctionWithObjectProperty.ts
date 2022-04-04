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
 * @param {string|Array<string>} functionNames The name of the function inside the new module
 * @param {string|Array<string>} oldModuleCall The old import name
 * @param {object} config The config object
 * @returns {void}
 */
const replaceable: ASTReplaceable = {
	replace(
		node: NodePath,
		name: string,
		fnName: string,
		oldModuleCall: string,
		config: {
			objectProperty: string | string[];
			functionNames: string | string[];
			conjunctionOperator: "||" | "&&";
		}
	): void {
		const oInsertionPoint = node.parentPath.value;
		const oInsertion = node.value;

		const aNodeModules: ESTree.Expression[] = [];
		let oResultNode;

		let functionNames = config.functionNames || fnName;
		if (!Array.isArray(functionNames)) {
			functionNames = [functionNames];
		}

		if (!Array.isArray(config.objectProperty)) {
			config.objectProperty = [config.objectProperty];
		}

		functionNames.forEach((functionName, iIndex) => {
			const oNodeIdentifier: ESTree.Identifier =
				builders.identifier(name);
			let oNodeModule: ESTree.Expression = oNodeIdentifier;
			if (config.objectProperty[iIndex]) {
				oNodeModule = builders.memberExpression(
					oNodeIdentifier,
					builders.identifier(config.objectProperty[iIndex])
				);
			}

			if (functionName) {
				oNodeModule = builders.memberExpression(
					oNodeModule,
					builders.identifier(functionName),
					false
				);
			}
			aNodeModules.push(oNodeModule);
		});

		if (config.conjunctionOperator && aNodeModules.length === 2) {
			oResultNode = builders.logicalExpression(
				config.conjunctionOperator,
				aNodeModules[0],
				aNodeModules[1]
			);
		} else {
			oResultNode = aNodeModules[0];
		}

		switch (oInsertion.type) {
			case Syntax.MemberExpression:
				{
					// MyModule.myField
					oInsertionPoint[node.name] = oResultNode;
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
