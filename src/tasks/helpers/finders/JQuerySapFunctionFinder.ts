import {Syntax} from "esprima";
import * as ESTree from "estree";
import {Literal} from "estree";
import * as recast from "recast";
import {NodePath} from "ui5-migration";

import {EMPTY_FINDER_RESULT, Finder, FinderResult} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

/**
 * DRAFT
 * @param node
 * @param aList
 * @returns {boolean}
 */
const fnNestedMember = function(node: ESTree.Node, aList: string[]): boolean {
	const sLast = aList.pop();
	if (
		sLast &&
		node.type === Syntax.MemberExpression &&
		(node as ESTree.MemberExpression).property.type === Syntax.Identifier &&
		((node as ESTree.MemberExpression).property as ESTree.Identifier).name
	) {
		const prop = (node as ESTree.MemberExpression)
			.property as ESTree.Identifier;
		const objProp = (node as ESTree.MemberExpression)
			.object as ESTree.Identifier;
		if (aList.length === 2) {
			return prop.name === sLast && objProp.name === aList.pop();
		}
		if (prop.name === sLast) {
			return fnNestedMember(node, aList);
		} else {
			return false;
		}
	} else {
		return false;
	}
};

/**
 * Finds the following 2 occurrences where: ":sapTabbable" is the first argument
 * <code>
 * jQuery.merge($Ref.parents().prevAll(), $Ref.prevAll()).find(':sapTabbable')
 * var $InteractiveElements = $Cell.find(":sapTabbable, input:sapFocusable,
 * .sapUiTableTreeIcon"); var aTabbables = jQuery(":sapTabbable",
 * that.$()).get();
 * </code>
 */
class JQuerySapFunctionFinder implements Finder {
	find(
		node: ESTree.Node,
		config: {finderIncludesName: string},
		sConfigName: string,
		defineCall: SapUiDefineCall
	): FinderResult {
		const aObject = sConfigName.split("."); // jQuery.sap.extend

		if (node.type === Syntax.CallExpression) {
			if (
				node.arguments.length > 0 &&
				node.arguments[0].type === Syntax.Literal
			) {
				const arg0: ESTree.Literal = node
					.arguments[0] as ESTree.Literal;

				if (
					typeof arg0.value === "string" &&
					arg0.value.includes &&
					arg0.value.includes(config.finderIncludesName)
				) {
					return {configName: sConfigName};
				}
			}
		}
		return EMPTY_FINDER_RESULT;
	}
}

/**
 *
 *
 * @param {recast.NodePath} node The top node of the module reference
 * @param {string} name The name of the new module
 * @param {string} fnName The name of the function inside the new module
 * @param {string} oldModuleCall The old import name
 * @returns {void}
 */
module.exports = new JQuerySapFunctionFinder();
