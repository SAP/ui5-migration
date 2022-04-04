import {Syntax} from "esprima";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
 * Replaces legacy ModuleSystem calls with proper loader config calls
 *
 * jQuery.sap.registerResourcePath("my/actual/path", "my/used/path");
 * ->
 * sap.ui.loader.config({paths:{"my/actual/path": "my/used/path"}});
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
		const oInsertionPoint = node.parentPath.parentPath.value;
		const oInsertion = node.parentPath.value;

		if (
			oInsertion.type === Syntax.CallExpression &&
			oInsertion.arguments &&
			oInsertion.arguments.length === 2
		) {
			const vArg1 = oInsertion.arguments[0];
			const vArg2 = oInsertion.arguments[1];
			let sCode;
			let sPath;
			let sMappedPath;

			if (vArg1.type === Syntax.Literal) {
				sPath = recast.print(vArg1).code;
				sMappedPath = recast.print(vArg2).code || "'.'";

				if (oldModuleCall === "jQuery.sap.registerModulePath") {
					sPath = sPath.replace(/\./g, "/");
					if (vArg2.type === Syntax.Literal) {
						// as we would otherwise overwrite our basepath, we need
						// to substitute a falsy vArg2
						sMappedPath = '"' + (vArg2.value || ".") + '"';
					}
				}

				sCode =
					"sap.ui.loader.config({paths:{" +
					sPath +
					":" +
					sMappedPath +
					"}})";
			} else {
				sPath = recast.print(vArg1).code;
				sMappedPath = recast.print(vArg2).code || ".";

				if (oldModuleCall === "jQuery.sap.registerModulePath") {
					sPath = sPath + '.replace(/\\./g,"/")';
					sMappedPath =
						sMappedPath === "."
							? sMappedPath
							: sMappedPath + '||"."';
				}

				sCode =
					"(function(){" +
					"var paths={};" +
					"paths[" +
					sPath +
					"]=" +
					sMappedPath +
					";" +
					"sap.ui.loader.config({paths:paths});" +
					"}())";
			}
			oInsertionPoint[node.parentPath.name] = builders.identifier(sCode);
		} else if (oInsertion.type !== Syntax.CallExpression) {
			throw new Error(
				"insertion is of type " +
					oInsertion.type +
					"supported are only Call-Expressions."
			);
		} else if (oInsertion.arguments.length !== 2) {
			throw new Error(
				"Not supported " + oldModuleCall + " call detected."
			);
		}
	},
};

module.exports = replaceable;
