import {Syntax} from "esprima";
import * as ESTree from "estree";
import * as recast from "recast";

import {NodePath} from "../util/ASTVisitor";

const builders = recast.types.builders;

// there is a mismatch between ESTree Node and recast Node,
// it is necessary to add the comments attribute to ESTree.Node
interface NodeComments {
	comments: ESTree.Comment[];
}
export type NodeWithComments = NodeComments & ESTree.Node;

/**
 * checks if a node is a safe spot to insert a comment
 *
 * @param {ESTree.Node} oNodePath the node to check
 * @returns {boolean} whether it is a safe spot
 */
function isSafeSpot(oNodePath: ESTree.Node): boolean {
	if (!oNodePath || !oNodePath.type) {
		return false;
	} else if (oNodePath.type.indexOf("Statement") >= 0) {
		return true;
	} else if (oNodePath.type === Syntax.VariableDeclaration) {
		return true;
	} else if (oNodePath.type === Syntax.SwitchCase) {
		return true;
	} else if (oNodePath.type === Syntax.CatchClause) {
		return true;
	} else {
		return false;
	}
}

/**
 * @param oNodePath
 * @param sComment
 * @returns whether or not comment was added
 */
export function addComment(oNodePath: NodePath, sComment: string) {
	if (sComment) {
		const commentAlreadyExists = hasCommentRec(oNodePath, sComment);
		if (!commentAlreadyExists) {
			let oCurNodePath = oNodePath;
			while (oCurNodePath && !isSafeSpot(oCurNodePath.value)) {
				oCurNodePath = oCurNodePath.parentPath;
			}
			if (!oCurNodePath) {
				oCurNodePath = oNodePath;
			}

			const oNode = oCurNodePath.value as NodeWithComments;
			if (!oNode.comments) {
				oNode.comments = [];
			}
			oNode.comments.push(builders.commentLine(sComment));
			return true;
		}
	}
	return false;
}

/**
 * Walks up the parent chain and checks whether or not the comment is present
 */
export function hasCommentRec(oNodePath: NodePath, sComment: string) {
	let oTempParent = oNodePath;
	while (oTempParent) {
		const oNode = oTempParent.value as NodeWithComments;
		if (
			oNode.comments &&
			oNode.comments.some(oComment => oComment.value === sComment)
		) {
			return true;
		}
		oTempParent = oTempParent.parentPath;
	}
	return false;
}
