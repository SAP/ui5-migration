import { Syntax } from 'esprima';
import * as recast from 'recast';
import { ASTReplaceable, NodePath } from 'ui5-migration';

import { ASTVisitor } from '../../../util/ASTVisitor';

const builders = recast.types.builders;

function containsThis(ast) {
  const oVisitor = new ASTVisitor();
  let bContainsThis = false;
  oVisitor.visit(ast, {
    visitThisExpression() {
      bContainsThis = true;
    },
  });
  return bContainsThis;
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
      const aArgs = oInsertionPoint[node.parentPath.name].arguments;

      let bUnknownCase = false;
      let bHasParams = false;
      let aArrayToAdd = [];
      if (aArgs.length === 4) {
        if (aArgs[3].type === Syntax.ArrayExpression) {
          aArrayToAdd = aArgs[3].elements;
          bHasParams = true;
        } else {
          bUnknownCase = true;
        }
      }

      /**
       * jQuery.sap.delayedCall(2000, this, function() {
       *		MessageToast.show("UploadComplete event triggered.");
       *	});
       *
       * becomes
       *
       * setInterval(function() {
       *		MessageToast.show("UploadComplete event triggered.");
       *	}.bind(this), 2000);
       */

      if (
        !bUnknownCase &&
        aArgs[2] &&
        (aArgs[2].type === Syntax.FunctionExpression ||
          aArgs[2].type === Syntax.MemberExpression ||
          aArgs[2].type === Syntax.Identifier)
      ) {
        const sText =
          '(function(){\n' + '	setInterval(fnMethod.bind(oObject), 0);\n' + '})';
        const oAst = recast.parse(sText);

        const oNodeSetInterval =
          oAst.program.body['0'].expression.body.body['0'].expression;
        oNodeSetInterval.arguments[1] = aArgs[0]; // iInterval

        if (
          aArgs[1] &&
          aArgs[1].type === Syntax.ThisExpression &&
          aArgs[2].type === Syntax.FunctionExpression
        ) {
          const bContainsThis = containsThis(aArgs[2]);
          if (bContainsThis) {
            oNodeSetInterval.arguments['0'].arguments = []; // oObject
            oNodeSetInterval.arguments['0'].arguments = [].concat(aArgs[1]);
          } else {
            oNodeSetInterval.arguments['0'].arguments = []; // leave empty as this is not contained
          }
        } else {
          oNodeSetInterval.arguments['0'].arguments = []; // oObject
          oNodeSetInterval.arguments['0'].arguments = [].concat(aArgs[1]);
        }

        if (bHasParams) {
          oNodeSetInterval.arguments[
            '0'
          ].arguments = oNodeSetInterval.arguments['0'].arguments.concat(
            aArrayToAdd
          ); // oObject
        }

        if (oNodeSetInterval.arguments['0'].arguments.length > 0) {
          oNodeSetInterval.arguments['0'].callee.object = aArgs[2]; // fnMethod
        } else {
          // if bind has no arguments, leave it out
          oNodeSetInterval.arguments['0'] = aArgs[2]; // fnMethod
        }
        oInsertionPoint[node.parentPath.name] = oNodeSetInterval;
      } else if (
        !bUnknownCase &&
        aArgs[2] &&
        aArgs[2].type === Syntax.Literal
      ) {
        /**
		* jQuery.sap.delayedCall(iInterval, this, "_resize", [a]);
		*
		* becomes
		*
		* setInterval(function(){
		  this["_resize"].apply([a]);
		}.bind(this), iInterval);
		*/

        const sText =
          '(function(){\n' +
          '	setInterval(oObject[fnMethod].bind(oObject), 0);\n' +
          '})';

        const oAst = recast.parse(sText);
        const oNodeSetInterval =
          oAst.program.body['0'].expression.body.body['0'].expression;

        // iInterval -> args 0

        oNodeSetInterval.arguments['1'] = aArgs[0];

        const oObjectCall = oNodeSetInterval.arguments['0'].callee.object;

        // this -> args 1
        oObjectCall.object = aArgs[1];

        // function name (string)
        oObjectCall.property = aArgs[2];

        // this -> args 1
        oNodeSetInterval.arguments['0'].arguments = []; // oObject
        oNodeSetInterval.arguments['0'].arguments = [].concat(aArgs[1]); // oObject
        if (bHasParams) {
          oNodeSetInterval.arguments[
            '0'
          ].arguments = oNodeSetInterval.arguments['0'].arguments.concat(
            aArrayToAdd
          ); // oObject
        }
        oInsertionPoint[node.parentPath.name] = oNodeSetInterval;
      } else if (aArgs[2]) {
        /**
		* if (jQuery.type(method) == "string") {
		method = oObject[method];
		}
		method.apply(oObject, aParameters || []);
		*/

        const sText =
          '(function () {\n' +
          '	setInterval(function () {\n' +
          '		var fnMethod = 0;\n' +
          '		if (typeof fnMethod === "string" || fnMethod instanceof String) {\n' +
          '			fnMethod = oObject[fnMethod];\n' +
          '		}\n' +
          '		fnMethod.apply();\n' +
          '	}.bind(oObject), 0);\n' +
          '})';

        const oAst = recast.parse(sText);
        const oNodeSetInterval =
          oAst.program.body['0'].expression.body.body['0'].expression;
        const oNodeSetIntervalBody =
          oNodeSetInterval.arguments['0'].callee.object.body.body;

        oNodeSetInterval.arguments[1] = aArgs[0]; // iInterval

        // aArgs[1] // oObject
        // aArgs[2] // fnMethod
        oNodeSetIntervalBody['0'].declarations['0'].init = aArgs[2];
        oNodeSetIntervalBody['1'].consequent.body['0'].expression.right.object =
          aArgs[1];
        const oNodeMethodCall = oNodeSetIntervalBody['2'];
        oNodeMethodCall.expression.callee.object.property = aArgs[2];
        oNodeMethodCall.expression.callee.object.object = aArgs[1];

        // check that bind argument is used (e.g. this arg)
        const bContainsThis =
          containsThis(aArgs[1]) ||
          containsThis(aArgs[2]) ||
          containsThis(aArgs[3]);

        if (bContainsThis) {
          oNodeSetInterval.arguments['0'].arguments['0'] = builders.identifier(
            'this'
          );
        } else {
          oNodeSetInterval.arguments['0'].arguments['0'] = aArgs[1];
        }

        oNodeMethodCall.expression.arguments = [];
        oNodeMethodCall.expression.arguments.push(aArgs[1]);
        if (aArgs.length > 3) {
          const argument = builders.logicalExpression(
            '||',
            aArgs[3],
            builders.arrayExpression([])
          );

          oNodeMethodCall.expression.arguments.push(argument);
        } else {
          oNodeMethodCall.expression.arguments.push(
            builders.arrayExpression([])
          );
        }
        oInsertionPoint[node.parentPath.name] = oNodeSetInterval;
      } else {
        throw new Error(
          'Failed to replace unknown IntervaledCall. Cannot determine 3rd argument (neither string nor function)'
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
