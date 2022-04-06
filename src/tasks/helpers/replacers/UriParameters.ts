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

			const windowLocationSearch = builders.memberExpression(
				builders.memberExpression(
					builders.identifier("window"),
					builders.identifier("location")
				),
				builders.identifier("search")
			);
			const fromQuery = builders.memberExpression(
				builders.identifier(name),
				builders.identifier("fromQuery")
			);
			const fromURL = builders.memberExpression(
				builders.identifier(name),
				builders.identifier("fromURL")
			);

			let oNodeModule;

			// jQuery.sap.getUriParameters() --> UriParameters.fromQuery(window.location.search)
			// jQuery.sap.getUriParameters(window.location.href) --> UriParameters.fromQuery(window.location.search)
			// jQuery.sap.getUriParameters(window.location.search) --> UriParameters.fromQuery(window.location.search)

			const queryParams = [
				"window.location.href",
				"window.location.search",
				"location.href",
				"location.search",
			];

			if (
				oldArgs.length === 0 ||
				(oldArgs.length === 1 &&
					queryParams.includes(print(oldArgs[0])))
			) {
				oNodeModule = fromQuery;
				newArgs.push(windowLocationSearch);

				// jQuery.sap.getUriParameters(myParam) --> UriParameters.fromURL(myParam || window.location.href)
			} else if (oldArgs.length === 1) {
				oNodeModule = fromURL;
				if (config.functionParameter) {
					const args: ESTree.Expression = (
						recast.parse(config.functionParameter).program.body[
							"0"
						] as ESTree.ExpressionStatement
					).expression;
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

function print(ast) {
	return recast.print(ast).code;
}

module.exports = replaceable;
