import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const fnModuleWithInvocation = require("./ModuleWithInvocation");
const builders = recast.types.builders;

/**
 * jQuery.sap.storage = storage(window).getInstance;
 * represents a module which exposes several functions such as
 * Module: storage
 * Functions: getInstance, Type
 *
 * @param {recast.NodePath} node The top node of the module reference
 * @param {string} name The name of the new module
 * @param {string} fnName The name of the function inside the new module
 * @param {string} oldModuleCall The old import name
 * @param {object} config Configuration
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
		const aExports = [builders.identifier("window")];
		return fnModuleWithInvocation.replaceInternal(
			node,
			name,
			fnName,
			oldModuleCall,
			config,
			aExports
		);
	},
};

module.exports = replaceable;
