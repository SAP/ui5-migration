import {Syntax} from "esprima";
import {ASTReplaceable, NodePath} from "ui5-migration";

/**
 * represents a module function which exposes itself as function
 * Module: encodeXML
 *
 * @param {recast.NodePath} node The top node of the module reference
 * @param {string} name The name of the new module
 * @param {string} fnName The name of the function inside the new module
 * @param {string} oldModuleCall The old import name
 * @param config
 * @returns {void}
 */
const replaceable: ASTReplaceable = {
	replace(
		node: NodePath,
		name: string,
		fnName: string,
		oldModuleCall: string,
		config: {newVariableName: string}
	): void {
		const nodeValue = node.value;

		if (nodeValue.type === Syntax.Identifier) {
			nodeValue.name = config.newVariableName;
		} else {
			throw new Error(
				"rename of " +
					nodeValue.type +
					" (supported are only Identifiers)"
			);
		}
	},
};

module.exports = replaceable;
