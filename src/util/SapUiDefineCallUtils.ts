/* tslint:disable:no-console */

"use strict";

import {SapUiDefineCall} from "./SapUiDefineCall";
import * as ESTree from "estree";

const Syntax = require("esprima").Syntax;

/*
 * resolves relative AMD module identifiers relative to a given base name
 */
export function resolveName(base: string, name: string) {
	let stack = base.split("/");
	stack.pop();
	name.split("/").forEach((segment, i) => {
		if (segment === "..") {
			stack.pop();
		} else if (segment === ".") {
			// ignore
		} else {
			if (i === 0) {
				stack = [];
			}
			stack.push(segment);
		}
	});
	return stack.join("/");
}

/*
 * checks whether the node is a "use strict" directive
 */
export function isDirective(node: ESTree.Node) {
	return (
		node.type === Syntax.ExpressionStatement &&
		(node as ESTree.ExpressionStatement).expression.type ===
			Syntax.Literal &&
		((node as ESTree.ExpressionStatement).expression as ESTree.Literal)
			.value === "use strict"
	);
}

/*
 * Checks whether the node is a qualified name (a.b.c) where the leftmost
 * identifier matches the given identifier
 */
export function isMemberOf(node: ESTree.Node, identifier: string) {
	if (node.type === Syntax.MemberExpression) {
		const oMemberExpression = node as ESTree.MemberExpression;
		if (oMemberExpression.object.type === Syntax.Identifier) {
			const oProperty = oMemberExpression.object as ESTree.Identifier;
			return oProperty.name === identifier;
		}
		return isMemberOf(oMemberExpression.object, identifier);
	}
	return false;
}

export function getObjectName(node: ESTree.Node): string | undefined {
	if (node.type === Syntax.MemberExpression) {
		const oMemberExpression = node as ESTree.MemberExpression;
		if (oMemberExpression.property.type === Syntax.Identifier) {
			const oProperty = oMemberExpression.property as ESTree.Identifier;
			return (
				getObjectName(oMemberExpression.object) + "." + oProperty.name
			);
		}
	} else if (node.type === Syntax.Identifier) {
		const oIdentifier = node as ESTree.Identifier;
		return oIdentifier.name;
	}
	return undefined;
}

interface ShortcutExpressionObject {
	leftmostName: string;
	propertyPath: string;
	module: string;
}

export function checkForShortcutExpression(
	defineCall: SapUiDefineCall,
	node: ESTree.Node
): ShortcutExpressionObject | undefined {
	if (
		!node ||
		node === null ||
		node.type !== Syntax.MemberExpression ||
		(node as ESTree.MemberExpression).property.type !== Syntax.Identifier
	) {
		return undefined;
	}

	let leftmost = node;
	const propertyPath = [];
	while (
		leftmost.type === Syntax.MemberExpression &&
		(leftmost as ESTree.MemberExpression).property.type ===
			Syntax.Identifier
	) {
		propertyPath.unshift(
			(
				(leftmost as ESTree.MemberExpression)
					.property as ESTree.Identifier
			).name
		);
		leftmost = (leftmost as ESTree.MemberExpression).object;
	}

	if (
		leftmost.type === Syntax.Identifier &&
		defineCall.paramNames &&
		defineCall.paramNames.indexOf((leftmost as ESTree.Identifier).name) >= 0
	) {
		const leftMostIdent = leftmost as ESTree.Identifier;
		const oModuleNode =
			defineCall.dependencyArray.elements[
				defineCall.paramNames.indexOf(leftMostIdent.name)
			];
		if (oModuleNode.type === Syntax.Literal) {
			const oLiteral = oModuleNode as ESTree.Literal;
			if (oLiteral.value) {
				const module = oLiteral.value.toString();
				return {
					leftmostName: leftMostIdent.name,
					propertyPath: propertyPath.join("."),
					module,
				};
			}
		}
	}
	return undefined;
}
