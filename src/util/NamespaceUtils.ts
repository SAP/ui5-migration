const recast = require("recast");
const Syntax = require("esprima").Syntax;
const builders = recast.types.builders;
import * as ESTree from "estree";
import {SapUiDefineCall} from "./SapUiDefineCall";

export function getCommonPart(ns1: string, ns2: string): string {
	const aResult = [];
	const ans1 = ns1.split(".");
	const ans2 = ns2.split(".");
	for (let i = 0; i < ans1.length; i++) {
		const part1 = ans1[i];
		const part2 = ans2[i];
		if (part1 === undefined) {
			break;
		}
		if (part1 === part2) {
			aResult.push(part1);
		} else {
			break;
		}
	}
	return aResult.join(".");
}

/**
 *
 * @param defineCall
 * @param sNamespace
 * @returns callExpression
 */
export function introduceObjectPathCreate(
	defineCall: SapUiDefineCall,
	sNamespace: string
) {
	defineCall.addDependency("sap/base/util/ObjectPath", "ObjectPath");
	const memberExpression = builders.memberExpression(
		builders.identifier("ObjectPath"),
		builders.identifier("create")
	);

	const expressionStatement = builders.expressionStatement(
		builders.callExpression(memberExpression, [
			builders.literal(sNamespace),
		])
	);
	expressionStatement.comments = [];
	expressionStatement.comments.push(
		builders.commentLine(" create namespace")
	);
	return expressionStatement;
}

/**
 *
 * @param ast
 * @param sNamespace e.g. "hpa.cei.customerjourneyinsight.s4.core"
 * @returns {boolean} whether or not namespace was found
 */
export function findNamespaceUsage(ast, sNamespace: string): boolean {
	if (sNamespace.startsWith("sap.")) {
		return false;
	}
	let bResult = false;
	recast.visit(ast, {
		visitMemberExpression(path) {
			if (!bResult && isStaticGlobal(path)) {
				const sObjectName = getObjectName(path.value); // e.g. a.b.c
				if (!sObjectName) {
					return false;
				}
				const sCommonPart = getCommonPart(sNamespace, sObjectName);
				if (sCommonPart) {
					bResult = true;
					return false;
				}
			}
			this.traverse(path);
			return undefined;
		},
	});

	return bResult;
}

export function isStaticGlobal(path): boolean {
	// identify left-most part of member expression
	let candidate = path.value;
	while (candidate.type === Syntax.MemberExpression && !candidate.computed) {
		candidate = candidate.object;
	}

	// if it is an identifier, check whether it belongs to the global scope
	if (candidate.type === Syntax.Identifier) {
		const scope = path.scope.lookup(candidate.name);
		return !scope || scope.isGlobal;
	}
	return false;
}

/**
 *
 * @param node
 * @returns {string}
 */
export function getObjectName(node: ESTree.Node): string {
	if (
		node.type === Syntax.MemberExpression &&
		(node as ESTree.MemberExpression).property.type === Syntax.Identifier
	) {
		return (
			getObjectName((node as ESTree.MemberExpression).object) +
			"." +
			((node as ESTree.MemberExpression).property as ESTree.Identifier)
				.name
		);
	} else if (node.type === Syntax.Identifier) {
		return (node as ESTree.Identifier).name;
	}
	return undefined;
}
