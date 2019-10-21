import { Syntax } from 'esprima';
import * as ESTree from 'estree';
import * as recast from 'recast';
import { ASTReplaceable, NodePath } from 'ui5-migration';

const builders = recast.types.builders;

/**
 * Creates a new instance with a logical or expression if there is one parameter
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
    let bReplaced = false;
    if (oInsertion.type === Syntax.CallExpression) {
      const oldArgs = oInsertion.arguments;
      if (oldArgs.length === 0) {
        let args = [];
        if (fnName) {
          const oAst = recast.parse(fnName).program.body['0'].expression;
          args = [oAst];
        }
        oInsertionPoint[node.parentPath.name] = builders.newExpression(
          builders.identifier(name),
          args
        );
        bReplaced = true;
      } else if (oldArgs.length === 1) {
        if (fnName) {
          const args: ESTree.Expression = recast.parse(fnName).program.body['0']
            .expression;
          const oFirstArg = oldArgs[0] as ESTree.Expression;
          const oLogicalExpression = builders.logicalExpression(
            '||',
            oFirstArg,
            args
          );
          oInsertionPoint[node.parentPath.name] = builders.newExpression(
            builders.identifier(name),
            [oLogicalExpression]
          );
          bReplaced = true;
        } else {
          oInsertionPoint[node.parentPath.name] = builders.newExpression(
            builders.identifier(name),
            [oldArgs[0]]
          );
          bReplaced = true;
        }
      }
    }
    if (!bReplaced) {
      throw new Error(
        'insertion is of type ' +
          oInsertion.type +
          '(supported are only Call- and Member-Expressions)'
      );
    }
  },
};

module.exports = replaceable;
