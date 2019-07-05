/// <reference types="estree" />


/**
 * The ui5-migration module, it is able to analyse and migrate
 * UI5 javascript code to better conform with the Best Practices.
 *
 */
declare module "ui5-migration" {
	import * as ESTree from "estree";



	/**
	 * Represents a function which modifies a given node
	 */
	export interface ASTReplaceable {
		/**
		 *
		 * @param node
		 * @param name
		 * @param fnName
		 * @param oldModuleCall
		 * @param config
		 */
		replace(node: NodePath, name: string, fnName: string, oldModuleCall: string, config?: object) : ASTReplaceableResult|void;

	}

	export interface ASTReplaceableResult {
		/**
		 * whether or not the replacement did modify the AST
		 */
		modified: boolean;

		/**
		 * Whether or not this replacement requires a dependency
		 */
		addDependency: boolean;
	}

	/**
	 * Enum for specifying the level of a report message
	 *
	 * @export
	 */
	export enum ReportLevel {
		ERROR = "error",
		WARNING = "warning",
		INFO = "info",
		DEBUG = "debug",
		TRACE = "trace"
	}

	/**
	 * Compares two report levels regarding their severity
	 *
	 * @export
	 * @param {ReportLevel} l1 The left-side operand
	 * @param {ReportLevel} l2 The right-side operand
	 * @returns {number} 0 if equal, 1 if l1 is more severe than l2, -1 if l1 is less severe than l2
	 */
	export function CompareReportLevel(l1: ReportLevel, l2: ReportLevel): number;

	export interface FindingLocation {
		endLine: number;
		endColumn: number;
		startLine: number;
		startColumn: number;
	}

	export interface Finding {
		message: string;
		location: FindingLocation;
		fileName: string;
		taskName: string;
	}

	/**
	 * Used by migration modules to report information or errors.
	 *
	 * @export
	 */
	export interface Reporter {
		/**
		 * Used as logger
		 * @param {module:ui5-migration.ReportLevel} level
		 * @param {string} msg
		 * @param {Node | SourceLocation} loc
		 */
		report(level: ReportLevel, msg: string, loc?: ESTree.Node | ESTree.SourceLocation):void;

		/**
		 * stores report relevant information
		 * @param {string} sKey
		 * @param {string | number} sValue
		 */
		collect(sKey:string, sValue:string|number):void;

		/**
		 * persists the finding
		 * @param message
		 * @param loc
		 */
		storeFinding(message: string, loc?: ESTree.SourceLocation);

		/**
		 * get reported entries
		 */
		getFindings(): Finding[];



		/**
		 * reports the collected information
		 */
		reportCollected(level: ReportLevel):void;

		finalize(): Promise<{}>;

		setContext(oContext:{}): void;
		getContext();
	}

	interface ReporterCtor {
		new(minLevel: ReportLevel):Reporter;
	}

	/**
	 * Information about the module currently processing
	 *
	 * @export
	 */
	export interface FileInfo {
		/**
		 * @returns the relative file path
		 */
		getPath(): string;
		getFileName(): string;
		getSourceCode(): string;
		getAST(): ESTree.Node;


		/**
		 * @return {Promise<ESTree.Node>} loads the content and resolves with the parsed AST
		 */
		loadContent(): Promise<ESTree.Node>;

		/**
		 * @return {boolean} whether or not file content was modified
		 */
		wasModified(): boolean;

		/**
		 * Marks the file content as modified
		 * @param {boolean} bWasModified
		 */
		markModified(bWasModified: boolean);


		/**
		 * Writes file content to sOutputPath
		 * @param {string} sOutputPath
		 * @param {object} [oOutputFormat]
		 * @param {Reporter} [oReporter]
		 * @return {Promise<string>} the file content which was saved
		 */
		saveContent(sOutputPath: string, oOutputFormat?: {}, oReporter?: Reporter): Promise<string>;


		/**
		 * Unloads the content of the file
		 */
		unloadContent(): void;

		/**
		 * @returns {string} the namespace
		 */
		getNamespace(): string;
	}

	/**
	 * Interface to query more modules
	 *
	 * @export
	 */
	export interface FileFinder {
		/**
		 *
		 * @param {string} path file path, e.g. test/MyFile.js
		 */
		findByPath(path: string): Promise<FileInfo | null>;
	}

	/**
	 * We store some extra information for each migration module
	 *
	 * @interface TaskExtra
	 */
	export interface TaskExtra {
		name: string;
		config: {};
	}

	/**
	 * All arguments the analyse step of a migration module gets
	 *
	 * @export
	 */
	export interface AnalyseArguments {
		reporter: Reporter;
		file: FileInfo;
		fileFinder: FileFinder;
		visitor?: ASTVisitor;
		config?: any;
		targetVersion?: string;
	}

	/**
	 * All arguments the migrate step of a migration module gets
	 *
	 * @export
	 */
	export interface MigrateArguments {
		reporter: Reporter;
		file: FileInfo;
		analyseResult: any;
		fileFinder: FileFinder;
		visitor?: ASTVisitor;
		config?: any;
		targetVersion?: string;
	}
	/**
	 * Represents a single migration module
	 *
	 * @export
	 */
	export interface Task {
		description: string;
		/**
		 * List of associated keywords, can be used to tag the Migration entities
		 */
		keywords: string[];
		/**
		 * Is used to sort the list of Migration entities.
		 * A higher priority means that the Migration entity is executed before the ones with lower priority.
		 */
		priority: number;
		configSchema?: any;
		/**
		 * List of keywords of tasks which are executed after the current task in the same order as they are defined in the array
		 */
		postTasks?: string[];
		/**
		 * @returns {Promise<{}>} resolves with a config object
		 */
		defaultConfig?: () => Promise<{}>;
		/**
		 * Analyses a module and reports relevant information
		 * This method *must not* modify the AST!
		 *
		 * @param {AnalyseArguments} args The argument object
		 * @returns {Promise<any>} The analyse result for the migrate step to use
		 */
		analyse: (args: AnalyseArguments) => Promise<any>;

		/**
		 * Migrates a module based on the result given by the analyse step
		 * This method may modify the AST.
		 *
		 * @param {MigrateArguments} args The argument object
		 * @returns {Promise<boolean>} Whether the AST was modified by this call
		 */
		migrate?: (args: MigrateArguments) => Promise<boolean>;
	}

	export const replaceGlobals: Task;
	export const addRenderers: Task;

	// ASTVisitor exports

	export type NodePath = TNodePath<ESTree.Node>;
	export type VisitorFunctions = Partial<FullVisitor>;

	/**
	 * A visitor implementation for estree-compatible AST
	 *
	 * @export
	 */
	export class ASTVisitor {
		constructor();

		/**
		 * Visits a node and all children recursive
		 *
		 * @param {ESTree.Node} rootNode The root node to be visited
		 * @param {VisitorFunctions} functions An object containing visit<ASTNodeType> functions
		 */
		visit(rootNode: ESTree.Node, functions: VisitorFunctions): void;

		/**
		 * Returns the single NodePath of a specified child node
		 *
		 * @param {TNodePath<T>} rootPath The parent root path
		 * @param {string} childName The name of the child in the node
		 * @returns {NodePath} The path to the child node or null if not found
		 */
		visitSingle<T extends ESTree.Node>(rootPath: TNodePath<T>, childName: string): NodePath;

		/**
		 * Marks all non-protected NodePaths to be reused in further visit calls
		 */
		resetCache(): void;
	}

	/**
	 * Represents a path of the visitor through the AST
	 * To prevent an instance from being reused, it has to be explicitly marked as protected.
	 *
	 * @export
	 */
	export interface TNodePath<T extends ESTree.BaseNode> {
		value: T;
		name: string;
		parentPath: TNodePath<ESTree.Node>;

		/**
		 * Marks a NodePath instance as protected, it will not be reused in further ASTVisitor calls
		 * This is implemented as reference count, e.g. when protecting a path twice, the path has to
		 * be `unprotect`ed twice to be reused by the ASTVisitor
		 *
		 * @returns {void}
		 */
		protect(): TNodePath<T>;

		/**
		 * Marks a NodePath instance as unprotected, if all protections have been lost, this instance
		 * can be reused by the ASTVisitor in further function calls.
		 *
		 * @returns {void}
		 */
		unprotect(): void;

	}

	// generated off @types/estree/estree.d.ts with some regular expressions
	interface FullVisitor {
		visitProgram(path: TNodePath<ESTree.Program>): boolean | void;
		visitFile(path: TNodePath<ESTree.Program>): boolean | void;
		visitEmptyStatement(path: TNodePath<ESTree.EmptyStatement>): boolean | void;
		visitBlockStatement(path: TNodePath<ESTree.BlockStatement>): boolean | void;
		visitExpressionStatement(path: TNodePath<ESTree.ExpressionStatement>): boolean | void;
		visitIfStatement(path: TNodePath<ESTree.IfStatement>): boolean | void;
		visitLabeledStatement(path: TNodePath<ESTree.LabeledStatement>): boolean | void;
		visitBreakStatement(path: TNodePath<ESTree.BreakStatement>): boolean | void;
		visitContinueStatement(path: TNodePath<ESTree.ContinueStatement>): boolean | void;
		visitWithStatement(path: TNodePath<ESTree.WithStatement>): boolean | void;
		visitSwitchStatement(path: TNodePath<ESTree.SwitchStatement>): boolean | void;
		visitReturnStatement(path: TNodePath<ESTree.ReturnStatement>): boolean | void;
		visitThrowStatement(path: TNodePath<ESTree.ThrowStatement>): boolean | void;
		visitTryStatement(path: TNodePath<ESTree.TryStatement>): boolean | void;
		visitWhileStatement(path: TNodePath<ESTree.WhileStatement>): boolean | void;
		visitDoWhileStatement(path: TNodePath<ESTree.DoWhileStatement>): boolean | void;
		visitForStatement(path: TNodePath<ESTree.ForStatement>): boolean | void;
		visitForInStatement(path: TNodePath<ESTree.ForInStatement>): boolean | void;
		visitDebuggerStatement(path: TNodePath<ESTree.DebuggerStatement>): boolean | void;
		visitFunctionDeclaration(path: TNodePath<ESTree.FunctionDeclaration>): boolean | void;
		visitVariableDeclaration(path: TNodePath<ESTree.VariableDeclaration>): boolean | void;
		visitVariableDeclarator(path: TNodePath<ESTree.VariableDeclarator>): boolean | void;
		visitThisExpression(path: TNodePath<ESTree.ThisExpression>): boolean | void;
		visitArrayExpression(path: TNodePath<ESTree.ArrayExpression>): boolean | void;
		visitObjectExpression(path: TNodePath<ESTree.ObjectExpression>): boolean | void;
		visitProperty(path: TNodePath<ESTree.Property>): boolean | void;
		visitFunctionExpression(path: TNodePath<ESTree.FunctionExpression>): boolean | void;
		visitSequenceExpression(path: TNodePath<ESTree.SequenceExpression>): boolean | void;
		visitUnaryExpression(path: TNodePath<ESTree.UnaryExpression>): boolean | void;
		visitBinaryExpression(path: TNodePath<ESTree.BinaryExpression>): boolean | void;
		visitAssignmentExpression(path: TNodePath<ESTree.AssignmentExpression>): boolean | void;
		visitUpdateExpression(path: TNodePath<ESTree.UpdateExpression>): boolean | void;
		visitLogicalExpression(path: TNodePath<ESTree.LogicalExpression>): boolean | void;
		visitConditionalExpression(path: TNodePath<ESTree.ConditionalExpression>): boolean | void;
		visitCallExpression(path: TNodePath<ESTree.CallExpression>): boolean | void;
		visitNewExpression(path: TNodePath<ESTree.NewExpression>): boolean | void;
		visitMemberExpression(path: TNodePath<ESTree.MemberExpression>): boolean | void;
		visitSwitchCase(path: TNodePath<ESTree.SwitchCase>): boolean | void;
		visitCatchClause(path: TNodePath<ESTree.CatchClause>): boolean | void;
		visitIdentifier(path: TNodePath<ESTree.Identifier>): boolean | void;
		visitLiteral(path: TNodePath<ESTree.Literal>): boolean | void;
		visitLiteral(path: TNodePath<ESTree.Literal>): boolean | void;
		visitForOfStatement(path: TNodePath<ESTree.ForOfStatement>): boolean | void;
		visitSuper(path: TNodePath<ESTree.Super>): boolean | void;
		visitSpreadElement(path: TNodePath<ESTree.SpreadElement>): boolean | void;
		visitArrowFunctionExpression(path: TNodePath<ESTree.ArrowFunctionExpression>): boolean | void;
		visitYieldExpression(path: TNodePath<ESTree.YieldExpression>): boolean | void;
		visitTemplateLiteral(path: TNodePath<ESTree.TemplateLiteral>): boolean | void;
		visitTaggedTemplateExpression(path: TNodePath<ESTree.TaggedTemplateExpression>): boolean | void;
		visitTemplateElement(path: TNodePath<ESTree.TemplateElement>): boolean | void;
		visitObjectPattern(path: TNodePath<ESTree.ObjectPattern>): boolean | void;
		visitArrayPattern(path: TNodePath<ESTree.ArrayPattern>): boolean | void;
		visitRestElement(path: TNodePath<ESTree.RestElement>): boolean | void;
		visitAssignmentPattern(path: TNodePath<ESTree.AssignmentPattern>): boolean | void;
		visitClassBody(path: TNodePath<ESTree.ClassBody>): boolean | void;
		visitMethodDefinition(path: TNodePath<ESTree.MethodDefinition>): boolean | void;
		visitClassDeclaration(path: TNodePath<ESTree.ClassDeclaration>): boolean | void;
		visitClassExpression(path: TNodePath<ESTree.ClassExpression>): boolean | void;
		visitMetaProperty(path: TNodePath<ESTree.MetaProperty>): boolean | void;
		visitImportDeclaration(path: TNodePath<ESTree.ImportDeclaration>): boolean | void;
		visitImportSpecifier(path: TNodePath<ESTree.ImportSpecifier>): boolean | void;
		visitImportDefaultSpecifier(path: TNodePath<ESTree.ImportDefaultSpecifier>): boolean | void;
		visitImportNamespaceSpecifier(path: TNodePath<ESTree.ImportNamespaceSpecifier>): boolean | void;
		visitExportNamedDeclaration(path: TNodePath<ESTree.ExportNamedDeclaration>): boolean | void;
		visitExportSpecifier(path: TNodePath<ESTree.ExportSpecifier>): boolean | void;
		visitExportDefaultDeclaration(path: TNodePath<ESTree.ExportDefaultDeclaration>): boolean | void;
		visitExportAllDeclaration(path: TNodePath<ESTree.ExportAllDeclaration>): boolean | void;
		visitAwaitExpression(path: TNodePath<ESTree.AwaitExpression>): boolean | void;
	}
}
