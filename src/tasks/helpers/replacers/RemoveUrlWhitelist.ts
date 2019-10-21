import { Syntax } from 'esprima';
import * as ESTree from 'estree';
import * as recast from 'recast';
import { ASTReplaceable, NodePath } from 'ui5-migration';

import * as CommentUtils from '../../../util/CommentUtils';

const builders = recast.types.builders;

/**
 * From:
 * jQuery.sap.removeUrlWhitelist(a);
 *
 * To:
 * URLWhitelist.delete(URLWhitelist.entries()[a]);
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
      const aArgs = oInsertion.arguments;

      if (aArgs[0]) {
        const sText =
          '(function () {\n' +
          '	URLWhitelist.delete(URLWhitelist.entries()[iIndexToReplace]);\n' +
          '})';
        const oAst = recast.parse(sText);
        const oNodeUrlWhitelistDelete =
          oAst.program.body['0'].expression.body.body['0'].expression;

        oNodeUrlWhitelistDelete.arguments[0].property = aArgs[0]; // iIndexToReplace

        oInsertionPoint[node.parentPath.name] = oNodeUrlWhitelistDelete;
      } else {
        CommentUtils.addComment(
          node,
          'TODO: Remove obsolete jQuery.sap.removeUrlWhitelist call'
        );
      }
    } else {
      throw new Error(
        'insertion is of type ' +
          oInsertion.type +
          '(supported are only Call-Expressions)'
      );
    }
  },
};

module.exports = replaceable;
