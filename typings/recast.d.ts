/**
 * As of January 2018 there exists no recast typings on NPM,
 * if there is, this file should probably be removed.
 * This file is not complete, it defines just enough to work with this project.
 */

declare module "recast" {
	import * as ESTree from "estree";

	export interface VariableDeclarationWithComments extends ESTree.VariableDeclaration {
		comments?: Array<AdvancedComment>;
	}

	export interface AdvancedComment extends ESTree.Comment {
		leading: boolean
	}

	export interface File extends ESTree.BaseNode {
		type: "File";
		name?: string;
		program: ESTree.Program;
	}

	export interface PrintResult {
		code: string;
		map?: any;
	}
	export type Options = Partial<FullOptions>;
	export const types: {
		builders: Builders;
	};

	export function parse(source: string | Buffer, options?: Options): File;
	export function visit(source: string | Buffer, options?: Options): File;
	export function print(node: ESTree.Node, options?: Options): PrintResult;

	// add new Builder methods as needed
	interface Builders {
		identifier: (name: string) => ESTree.Identifier;
		ifStatement: (test: ESTree.Expression, consequent: ESTree.Statement, alternate?: ESTree.Statement | null) => ESTree.IfStatement;
		literal: (value: string | boolean | null | number | RegExp) => ESTree.Literal;
		arrayPattern: (elements: ESTree.Pattern[]) => ESTree.ArrayPattern;
		arrayExpression: (elements: ESTree.Expression[]) => ESTree.ArrayExpression;
		memberExpression: (object: ESTree.Identifier | ESTree.Expression, property: ESTree.Identifier | ESTree.Expression, computed?: boolean) => ESTree.MemberExpression;
		logicalExpression: (operator: "||" | "&&", left: ESTree.Expression, right: ESTree.Expression) => ESTree.LogicalExpression;
		binaryExpression: (operator: | 'in' | '+' | '-' | '*' | '/' | '%' | '**' | '|' | '^' | '&' | '==' | '!=' | '===' | '!==' |
		'<' | '>' | '<=' | '>=' | '<<' | '>>' | '>>>' | 'instanceof', left: ESTree.Expression, right: ESTree.Expression) => ESTree.BinaryExpression;
		callExpression: (callee: ESTree.Expression, arguments: (ESTree.Expression | ESTree.SpreadElement)[]) => ESTree.CallExpression;
		functionExpression: (id: ESTree.Identifier | null, params: ESTree.Pattern[], body: ESTree.BlockStatement) => ESTree.FunctionExpression;
		blockStatement: (body: ESTree.Statement[]) => ESTree.BlockStatement;
		expressionStatement: (expression: ESTree.Expression) => ESTree.ExpressionStatement;
		returnStatement: (argument?: ESTree.Expression) => ESTree.ReturnStatement;
		conditionalExpression: (test: ESTree.Expression, consequent: ESTree.Expression, alternate: ESTree.Expression) => ESTree.ConditionalExpression;
		newExpression: (constructor: ESTree.Expression, args?: (ESTree.Expression | ESTree.SpreadElement)[]) => ESTree.NewExpression;
		variableDeclaration: (kind: "var" | "let" | "const", declarations: ESTree.VariableDeclarator[]) => VariableDeclarationWithComments;
		variableDeclarator: (id: ESTree.Pattern, init?: ESTree.Expression) => ESTree.VariableDeclarator;
		unaryExpression: (operator: ESTree.UnaryOperator, argument: ESTree.Expression, prefix?: boolean) => ESTree.UnaryExpression;
		assignmentExpression: (operator: ESTree.AssignmentOperator, left: ESTree.Pattern, right: ESTree.Expression) => ESTree.AssignmentExpression;
		commentLine: (value: string) => ESTree.Comment;
		commentBlock: (value: string) => ESTree.Comment;
		objectExpression: (properties: ESTree.Property[]) => ESTree.ObjectExpression;
		property: (kind: 'get' | 'set' | 'init', key: ESTree.Identifier | ESTree.Literal, value: ESTree.ObjectExpression | ESTree.Identifier | ESTree.Literal | null,
			computed?: boolean, method?: false, shorthand?: boolean) => ESTree.Property;
		simpleLiteral: () => ESTree.SimpleLiteral;
		stringLiteral: (value: string) => ESTree.Literal;
	}

	// see https://github.com/benjamn/recast/blob/master/lib/options.js for documentation
	interface FullOptions {
		parser: any,
		tabWidth: number,
		useTabs: boolean,
		reuseWhitespace: boolean,
		lineTerminator: string,
		wrapColumn: number,
		sourceFileName: string,
		sourceRoot: string,
		lineSourceMap: any,
		range: boolean,
		tolerant: boolean,
		quote: "single" | "double" | "auto",
		trailingComma: boolean,
		arrayBracketSpacing: boolean,
		objectCurlySpacing: boolean,
		arrowParensAlways: boolean,
		flowObjectCommas: boolean
	}
}
