import {Syntax} from "esprima";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;
/**
 *
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

		// CallExpression
		if (oInsertion.type === Syntax.CallExpression) {
			const aArgs = oInsertionPoint[node.parentPath.name].arguments;

			// Determine Parameters
			let oPath = aArgs[0];
			if (oPath && oPath.type !== Syntax.Literal) {
				oPath = builders.logicalExpression(
					"||",
					aArgs[0],
					builders.literal("")
				);
			}
			const oNoCreates = aArgs[1];
			const oContext = aArgs[2];

			/**
			 * before
			 * jQuery.sap.getObject(sPath, iNoCreates, oContext)
			 *
			 * If iNoCreates is present:
			 *  - if iNoCreates == 0 || null the context will be created by the
			 * getObject function (create)
			 *  - if isNaN(iNoCreates) represented by undefined, the context
			 * will not be created (only get)
			 *  - else no replacement can be made
			 *
			 * after:
			 * ObjectPath.get(sPath, oContext) || ObjectPath.create(sPath,
			 * oContext);
			 *
			 * Limitations when using ObjectPath:
			 * When having a falsy value on the path, ObjectPath.create throws
			 * an error, which the legacy API did not. Those cases have to be
			 * adapted manually, but occurences should not be too many, as this
			 * is more an exotic use case.
			 *
			 */

			if (
				aArgs.length === 1 ||
				(aArgs.length >= 2 &&
					oNoCreates &&
					oNoCreates.type === Syntax.Identifier &&
					oNoCreates.name === "undefined")
			) {
				oInsertionPoint[node.parentPath.name].callee =
					builders.identifier("ObjectPath.get");
				oInsertionPoint[node.parentPath.name].arguments = oContext
					? [oPath, oContext]
					: [oPath];
			} else if (
				aArgs.length >= 2 &&
				oNoCreates &&
				oNoCreates.type === Syntax.Literal &&
				(oNoCreates.value === null || oNoCreates.value === 0)
			) {
				oInsertionPoint[node.parentPath.name] = builders.callExpression(
					builders.identifier("ObjectPath.create"),
					oContext ? [oPath, oContext] : [oPath]
				);
			} else {
				throw new Error(
					"Failed to replace getObject. Cannot determine 2nd or 3rd parameter"
				);
			}
		} else {
			throw new Error(
				"insertion is of type " +
					oInsertion.type +
					"(supported are only Call-Expressions)"
			);
		}
	},
};

module.exports = replaceable;
