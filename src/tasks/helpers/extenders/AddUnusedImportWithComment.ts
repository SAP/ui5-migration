import { Syntax } from 'esprima';
import * as ESTree from 'estree';
import * as recast from 'recast';

import { Extender } from '../../../dependencies';
import { NodeWithComments } from '../../../util/CommentUtils';
import { SapUiDefineCall } from '../../../util/SapUiDefineCall';

const addUnusedImport = require('./AddUnusedImport');
const builders = recast.types.builders;

class AddUnusedImportWithComment implements Extender {
  extend(
    defineCall: SapUiDefineCall,
    config: {
      commentText: string;
      newModulePath: string;
    }
  ): boolean {
    const bExtended = addUnusedImport.extend(defineCall, config);

    if (bExtended && typeof config.commentText === 'string') {
      const node = defineCall.getNodeOfImport(
        config.newModulePath
      ) as NodeWithComments;
      if (node.comments == null) {
        node.comments = [builders.commentLine(config.commentText)];
      }
      return true;
    }
    return bExtended;
  }
}

module.exports = new AddUnusedImportWithComment();
