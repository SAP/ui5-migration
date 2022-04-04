import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;

/**
 * Setting this flag to true leads to some replacement limitations.
 * TODO: Should be set via configuration in the future.
 */
const bIgnoreExoticCases = true;

/**
 *
 *
 * @param {recast.NodePath} node Not used
 * @param {string} name Not used
 * @param {string} fnName Not used
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
		const oInsertionPoint: ESTree.Node = node.parentPath.parentPath.value;
		const oInsertion: ESTree.Node = node.parentPath.value;
		let aArgs = [];
		let oNewExpression: ESTree.Expression;
		let oNewExpressionWithoutSuffix: ESTree.Expression;
		const rOrginalSubTypes =
			/\.(?:(?:(?:view\.|fragment\.|controller\.|designtime\.)?js)|(?:(?:view\.|fragment\.)?xml)|(?:(?:view\.|fragment\.)?json)|(?:(?:view\.|fragment\.)?html)|[^.]+)$/;
		const oSapUi: ESTree.MemberExpression = builders.memberExpression(
			builders.identifier("sap"),
			builders.identifier("ui")
		);
		const oSapUiRequire: ESTree.MemberExpression =
			builders.memberExpression(oSapUi, builders.identifier("require"));
		const oSapUiRequireToUrl: ESTree.MemberExpression =
			builders.memberExpression(
				oSapUiRequire,
				builders.identifier("toUrl")
			);

		if (oInsertion.type === Syntax.CallExpression) {
			aArgs = oInsertionPoint[node.parentPath.name].arguments;
		}
		if (aArgs.length === 0) {
			throw new Error(
				"Failed to replace" + oldModuleCall + ". No parameter is given."
			);
		}

		const isGetModulePathCall =
			oldModuleCall === "jQuery.sap.getModulePath";

		function ui5ToRJS(sName: string) {
			if (/^jquery\.sap\./.test(sName)) {
				return sName;
			}
			return sName.replace(/\./g, "/");
		}

		function appendSuffixIfNecessary(
			oExpressionWithoutSuffix: ESTree.Expression,
			aModuleArgs: ESTree.Node[],
			sSuffix?: string
		) {
			if (sSuffix && aModuleArgs.length === 1) {
				// Suffix newly created
				return builders.binaryExpression(
					"+",
					oExpressionWithoutSuffix,
					builders.literal(sSuffix)
				);
			} else if (
				aModuleArgs[1] &&
				aModuleArgs[1].type === Syntax.Literal
			) {
				const literal = aModuleArgs[1] as ESTree.Literal;
				const value = literal.value as
					| string
					| number
					| boolean
					| RegExp;
				return builders.binaryExpression(
					"+",
					oExpressionWithoutSuffix,
					builders.literal(value)
				);
			} else if (aModuleArgs[1]) {
				sSuffix = recast.print(aModuleArgs[1]).code;
				return builders.binaryExpression(
					"+",
					oExpressionWithoutSuffix,
					builders.identifier(sSuffix)
				);
			} else {
				return oExpressionWithoutSuffix;
			}
		}

		if (aArgs[0] && aArgs[0].type === Syntax.Literal) {
			let sSuffix: string;
			let sResourceValue: string = aArgs[0].value;

			/* sap.ui.require.toUrl throws an error when the resource name
		(first parameter) is starting with a slash. Therefore starting slashes
		are removed.*/
			if (sResourceValue.indexOf("/") === 0) {
				sResourceValue = sResourceValue.substring(1);
			}

			if (isGetModulePathCall) {
				sResourceValue = ui5ToRJS(sResourceValue);
			}
			if (aArgs.length === 1 && sResourceValue !== "") {
				const aSegments = sResourceValue.split(/\//);
				const aMatches = rOrginalSubTypes.exec(
					aSegments[aSegments.length - 1]
				);
				if (aMatches) {
					sSuffix = aMatches[0];
					aSegments[aSegments.length - 1] = aSegments[
						aSegments.length - 1
					].slice(0, aMatches.index);
					sResourceValue = aSegments.join("/");
				} else {
					sSuffix = "";
				}
			}

			// Ensure that sap.ui.require.toUrl is never called with a string
			// starting with a slash (leads to a thrown error)
			sResourceValue = String(sResourceValue).replace(/^\/*/, "");

			// Ensures that libraries with dots are supported. Otherwise the
			// sap.ui.require.toUrl API would split the library name with dots
			// in resource and suffix part.
			if (!sResourceValue.endsWith("/") && !bIgnoreExoticCases) {
				sResourceValue += "/";
			}

			oNewExpressionWithoutSuffix = builders.callExpression(
				oSapUiRequireToUrl,
				[builders.literal(sResourceValue)]
			);
			oNewExpression = appendSuffixIfNecessary(
				oNewExpressionWithoutSuffix,
				aArgs,
				sSuffix
			);
		} else if (aArgs[0]) {
			let sResourceCode: string = recast.print(aArgs[0]).code;
			if (isGetModulePathCall) {
				if (bIgnoreExoticCases) {
					sResourceCode =
						"(" + sResourceCode + ').replace(/\\./g, "/")';
				} else {
					sResourceCode =
						"(function(){if(/^jquery\\.sap\\./.test(" +
						sResourceCode +
						")){return " +
						sResourceCode +
						";}" +
						"else { return (" +
						sResourceCode +
						').replace(/\\./g, "/");}}.bind(this)())';
				}
			}
			if (aArgs.length === 1) {
				let sReplacement;
				if (bIgnoreExoticCases) {
					sReplacement =
						"sap.ui.require.toUrl(" + sResourceCode + ")";
				} else {
					sReplacement =
						"(function(){" +
						"var aParts = (" +
						sResourceCode +
						').match(/(?:(.*\\.(?:view|fragment|controller|designtime))(\\.js|\\.xml|\\.json|\\.html))$/) || ["",' +
						sResourceCode +
						', ""];' +
						"return sap.ui.require.toUrl(aParts[1]) + aParts[2];}.bind(this)())";
				}
				oNewExpression = builders.identifier(sReplacement);
			} else {
				oNewExpressionWithoutSuffix = builders.callExpression(
					oSapUiRequireToUrl,
					[builders.identifier(sResourceCode)]
				);
				oNewExpression = appendSuffixIfNecessary(
					oNewExpressionWithoutSuffix,
					aArgs
				);
			}
		}
		oInsertionPoint[node.parentPath.name] = oNewExpression;
	},
};

module.exports = replaceable;
