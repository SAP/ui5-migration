import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
 * jQuery.sap.parseJS = JSTokenizer().parseJS;
 * represents a module which exposes several functions such as
 * Module: log
 * Functions: warning, info
 *
 * @param {recast.NodePath} node The top node of the module reference
 * @param {string} name The name of the new module
 * @param {string} fnName The name of the function inside the new module
 * @param {string} oldModuleCall The old import name
 * @param {object} config Configuration
 * @param {ESTree.Expression[]} [aParams] Additional params given to the module invocation
 * @returns {void}
 */

class ModuleWithInvocationReplaceable implements ASTReplaceable {
	replace(
		node: NodePath,
		name: string,
		fnName: string,
		oldModuleCall: string,
		config: {}
	) {
		return this.replaceInternal(node, name, fnName, oldModuleCall, config);
	}

	replaceInternal(
		node: NodePath,
		name: string,
		fnName: string,
		oldModuleCall: string,
		config: {},
		aParams: ESTree.Expression[] = []
	): void {
		const oInsertionPoint = node.parentPath.value;
		const oInsertion = node.value;
		const oNodeFunction = builders.memberExpression(
			builders.callExpression(builders.identifier(name), aParams),
			builders.identifier(fnName),
			false
		);

		if (oInsertionPoint.type === Syntax.CallExpression) {
			oInsertionPoint.callee = oNodeFunction;
		} else if (oInsertionPoint.type === Syntax.MemberExpression) {
			oInsertionPoint.object = oNodeFunction;
		} else if (oInsertionPoint.type === Syntax.VariableDeclarator) {
			oInsertionPoint.init = oNodeFunction;
		} else if (oInsertionPoint.type === Syntax.BinaryExpression) {
			oInsertionPoint[node.name] = oNodeFunction;
		} else {
			throw new Error(
				"insertion is of type " +
					oInsertion.type +
					"(supported are only Call- and Member-Expressions)"
			);
		}
	}
}

module.exports = new ModuleWithInvocationReplaceable();
