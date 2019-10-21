import {ASTReplaceable, ASTReplaceableResult} from "ui5-migration";

import {NodePath} from "../../../util/ASTVisitor";
import * as Comments from "../../../util/CommentUtils";

const replaceable: ASTReplaceable = {
	replace(
		node: NodePath,
		name: string,
		fnName: string,
		oldModuleCall: string,
		config: {commentText: string}
	): ASTReplaceableResult {
		if (
			typeof config !== "object" ||
			typeof config.commentText !== "string"
		) {
			throw new Error("AddComment without commentText config");
		} else {
			Comments.addComment(node, config.commentText as string);
			return {modified: true, addDependency: false};
		}
	},
};

module.exports = replaceable;
