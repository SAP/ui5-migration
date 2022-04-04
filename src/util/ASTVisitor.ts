import * as ESTree from "estree";

import {
	NodePath,
	Reporter,
	ReportLevel,
	TNodePath,
	VisitorFunctions,
} from "../Migration";

export {NodePath, TNodePath} from "../Migration"; // re-expose the pure interfaces for consistency

/**
 * If more than CACHE_MAX_GROWTH * count of paths are requested, the cache
 * is reset before a new path is created
 */
const CACHE_MAX_GROWTH = 2.0;

/**
 * The count of paths created by the ASTVisitor constructor to prefill the cache
 */
const START_CACHE_SIZE = 256;

enum CacheResetCause {
	Manual = "M",
	TooMuchNewPaths = "N",
}

/**
 * The implementation of the NodePath interface, provides a reference counter
 * This reference counting is always done all along the parent chain to ensure
 * that the parentPath nodes didn't enter the realm of nothingness.
 *
 * @class NodePathImpl
 * @implements {NodePath}
 */
class NodePathImpl implements NodePath {
	value: ESTree.Node;
	name: string;
	parentPath: NodePath;

	protected: number;
	available: boolean;

	constructor() {
		this.reset();
	}

	reset(): this {
		this.protected = 0;
		this.available = true;
		this.value = null;
		this.name = null;
		this.parentPath = null;
		return this;
	}

	protect(): this {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let oCurNode: NodePathImpl = this;
		while (oCurNode) {
			oCurNode.protected++;
			oCurNode = oCurNode.parentPath as NodePathImpl;
		}
		return this;
	}

	unprotect(): this {
		if (this.protected > 0) {
			// eslint-disable-next-line @typescript-eslint/no-this-alias
			let oCurNode: NodePathImpl = this;
			while (oCurNode) {
				if (oCurNode.protected > 0) {
					oCurNode.protected--;
				}
				oCurNode = oCurNode.parentPath as NodePathImpl;
			}
		}
		return this;
	}
}

export class ASTVisitor {
	private newPaths: number; // count of requested paths since the last cache reset
	private allNodePaths: NodePathImpl[];
	private availableNodePaths: NodePathImpl[];
	private reporter: Reporter;

	constructor(reporter?: Reporter, startCacheSize = START_CACHE_SIZE) {
		// Create some NodePath instances in the cache to use
		this.allNodePaths = new Array<NodePathImpl>(startCacheSize);
		this.availableNodePaths = new Array<NodePathImpl>(startCacheSize);

		for (let i = 0; i < this.allNodePaths.length; i++) {
			const oNewPath = new NodePathImpl();
			this.allNodePaths[i] = oNewPath;
			this.availableNodePaths[i] = oNewPath;
		}

		this.newPaths = 0;
		this.reporter = reporter;
	}

	/**
	 * Creates a new path using the cache.
	 * Also this function may reset the cache if needed.
	 *
	 * @private
	 * @param {ESTree.Node} value AST node of path
	 * @param {string} name name of the node in the parent
	 * @param {NodePathImpl} parentPath Parent path
	 * @returns
	 * @memberof ASTVisitor
	 */
	private _createPath(
		value: ESTree.Node,
		name: string,
		parentPath: NodePathImpl
	): NodePathImpl {
		let oPath: NodePathImpl;
		if (this.availableNodePaths.length) {
			// there is a path ready to use
			oPath = this.availableNodePaths.pop().reset();
		} else if (
			this.newPaths * CACHE_MAX_GROWTH >=
			this.allNodePaths.length
		) {
			// too many paths were requested since last cache reset
			this.resetCache(CacheResetCause.TooMuchNewPaths);
			return this._createPath(value, name, parentPath);
		} else {
			// create a new instance
			oPath = new NodePathImpl();
			this.allNodePaths.push(oPath);
			this.newPaths++;
		}

		oPath.available = false;
		oPath.value = value;
		oPath.name = name;
		oPath.parentPath = parentPath;
		return oPath;
	}

	/**
	 * checks if node[name] is an object/array the ASTVisitor should traverse
	 * into
	 *
	 * @private
	 * @param {ESTree.Node} node
	 * @param {string} name
	 * @returns {boolean}
	 * @memberof ASTVisitor
	 */
	private _checkChild(node: ESTree.Node, name: string): boolean {
		if (typeof node[name] === "object" && node[name]) {
			if (
				Array.isArray(node[name]) &&
				node[name].length > 0 &&
				node[name][0] &&
				typeof node[name][0].type === "string"
			) {
				return true;
			} else if (typeof node[name].type === "string") {
				return true;
			}
		}
		return false;
	}

	/**
	 * Returns the single NodePath of a specified child node
	 *
	 * @template T
	 * @param {TNodePath<T>} rootPath The parent root path
	 * @param {string} childName The name of the child in the node
	 * @returns {NodePath} The path to the child node or null if not found
	 * @memberof ASTVisitor
	 */
	visitSingle<T extends ESTree.Node>(
		rootPath: TNodePath<T>,
		childName: string
	): NodePath {
		if (!rootPath || !childName || !(rootPath instanceof NodePathImpl)) {
			return null;
		} else if (this._checkChild(rootPath.value, childName)) {
			return this._createPath(
				rootPath.value[childName],
				childName,
				rootPath as NodePathImpl
			);
		} else {
			return null;
		}
	}

	/**
	 * Visits a node and all children recursive
	 *
	 * @param {ESTree.Node} rootNode The root node to be visited
	 * @param fncts
	 * @memberof ASTVisitor
	 */
	visit(rootNode: ESTree.Node, fncts: VisitorFunctions): void {
		const stack: NodePathImpl[] = [
			this._createPath(rootNode, null, null).protect(),
		];
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;

		// the context used to call the visitor functions
		const visitorObject = {
			pushChild(path, node, key) {
				if (that._checkChild(node, key)) {
					const oNewPath = that._createPath(node[key], key, path);
					oNewPath.protect(); // keep it protected until we pop it
					// off the stack
					stack.push(oNewPath);
				}
			},

			traverse(path: NodePathImpl) {
				const oNode = path.value;
				if (Array.isArray(oNode)) {
					for (let i = oNode.length - 1; i >= 0; i--) {
						this.pushChild(path, oNode, i.toString());
					}
				} else {
					for (const sKey in oNode) {
						// eslint-disable-next-line no-prototype-builtins
						if (oNode.hasOwnProperty(sKey)) {
							this.pushChild(path, oNode, sKey);
						}
					}
				}
			},
		};

		// main loop
		while (stack.length) {
			const oTop = stack.pop();
			const sFnctName = "visit" + oTop.value.type;
			if (oTop.value.type && sFnctName in fncts) {
				fncts[sFnctName].call(visitorObject, oTop);
			} else {
				visitorObject.traverse(oTop);
			}
			oTop.unprotect();
		}
	}

	/**
	 * Marks all non-protected NodePaths to be reused in further visit calls
	 *
	 * @memberof ASTVisitor
	 */
	resetCache(cause?: CacheResetCause) {
		if (!cause) {
			cause = CacheResetCause.Manual;
		}
		let iFreedPaths = 0,
			iProtectedPaths = 0; // used for statistics

		for (let i = 0; i < this.allNodePaths.length; i++) {
			const oPath = this.allNodePaths[i];
			if (oPath.protected <= 0 && !oPath.available) {
				oPath.reset();
				this.availableNodePaths.push(oPath);
				iFreedPaths++;
			} else if (oPath.protected > 0) {
				iProtectedPaths++;
			}
		}
		this.newPaths = 0;

		if (this.reporter) {
			const sFullMsg =
				`AST Visitor cache reset Cause: ${cause} All: ${this.allNodePaths.length} ` +
				`Prot: ${iProtectedPaths} "Freed ${iFreedPaths} New: ${this.newPaths}`;
			this.reporter.report(ReportLevel.TRACE, sFullMsg, undefined);
		}
	}
}
