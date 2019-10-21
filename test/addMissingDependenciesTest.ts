import {
  CustomFileFinder,
  CustomFileInfo,
  CustomReporter,
} from './util/testUtils';

const assert = require('assert');
const fs = require('graceful-fs');
const recast = require('recast');
const rootDir = './test/addMissingDependencies/';

import { analyse, migrate } from '../src/tasks/addMissingDependencies';

const fileFinder = new CustomFileFinder();

function analyseMigrateAndTest(
  module: CustomFileInfo,
  expectedModification: boolean,
  expectedContent: string,
  config: {},
  done?: Function,
  expectedReports: string[] = [],
  level = 'debug'
) {
  const reporter = new CustomReporter([], level);
  const pAnalysisAndMigration = analyse({
    file: module,
    fileFinder,
    reporter,
    config,
  })
    .then(function(analyseResult) {
      if (migrate && analyseResult) {
        return migrate({
          file: module,
          fileFinder,
          reporter,
          analyseResult,
          config,
        });
      } else {
        return false;
      }
    })
    .then(function(didModify) {
      assert.strictEqual(
        didModify,
        expectedModification,
        'Modification has invalid value'
      );
      const actualContent = recast.print(module.getAST(), {
        lineTerminator: '\n',
        useTabs: true,
      }).code;
      assert.equal(actualContent, expectedContent);

      assert.deepStrictEqual(reporter.getReports(), expectedReports);
    });
  if (!done) {
    return pAnalysisAndMigration;
  }
  return pAnalysisAndMigration
    .then(function() {
      done();
    })
    .catch(function(e) {
      done(e);
    });
}

describe('addMissingDependencies', function() {
  describe('#start()', function() {
    it('should addMissingDependencies', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'test.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(rootDir + 'test.config.json', 'utf8')
      );
      const module = new CustomFileInfo(rootDir + 'test.js');
      analyseMigrateAndTest(module, true, expectedContent, config, done, []);
    });

    it('should addMissingDependencies for FunctionFinder', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'test2.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(rootDir + 'test2.config.json', 'utf8')
      );
      const module = new CustomFileInfo(rootDir + 'test2.js');
      analyseMigrateAndTest(module, true, expectedContent, config, done, []);
    });

    it('should addMissingDependencies only for jQuery calls', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'control.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(rootDir + 'control.config.json', 'utf8')
      );
      const module = new CustomFileInfo(rootDir + 'control.js');
      analyseMigrateAndTest(module, true, expectedContent, config, done, []);
    });

    it('should addMissingDependencies for jQuery.Event', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'event.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(rootDir + 'event.config.json', 'utf8')
      );
      const module = new CustomFileInfo(rootDir + 'event.js');
      analyseMigrateAndTest(module, true, expectedContent, config, done, []);
    });

    it('should addMissingDependencies for jQuery.Event.getPseudoTypes', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'pseudotypes.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(rootDir + 'pseudotypes.config.json', 'utf8')
      );
      const module = new CustomFileInfo(rootDir + 'pseudotypes.js');
      analyseMigrateAndTest(module, true, expectedContent, config, done, []);
    });

    it('should addMissingDependencies for jQuery selectors', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'selector.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(rootDir + 'selector.config.json', 'utf8')
      );
      const module = new CustomFileInfo(rootDir + 'selector.js');
      analyseMigrateAndTest(module, true, expectedContent, config, done, []);
    });

    it('should addMissingDependencies for multiple with mixed addImport and addUnusedImport', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'multiple.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(rootDir + 'multiple.config.json', 'utf8')
      );
      const module = new CustomFileInfo(rootDir + 'multiple.js');
      analyseMigrateAndTest(module, true, expectedContent, config, done, []);
    });

    it('add import with comment', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'addCommentToImport.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(rootDir + 'addCommentToImport.config.json', 'utf8')
      );
      const module = new CustomFileInfo(rootDir + 'addCommentToImport.js');
      analyseMigrateAndTest(module, true, expectedContent, config, done, []);
    });

    it('Renaming jQueryDOM', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'renaming.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(rootDir + 'renaming.config.json', 'utf8')
      );
      const module = new CustomFileInfo(rootDir + 'renaming.js');
      analyseMigrateAndTest(module, true, expectedContent, config, done, []);
    });

    it('Renaming jQueryDOM 2 variables', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'renamingVars.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(rootDir + 'renamingVars.config.json', 'utf8')
      );
      const module = new CustomFileInfo(rootDir + 'renamingVars.js');
      analyseMigrateAndTest(module, true, expectedContent, config, done, []);
    });

    it('Find jQuery SAP calls', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'findJQuerySapCalls.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(rootDir + 'findJQuerySapCalls.config.json', 'utf8')
      );
      const module = new CustomFileInfo(rootDir + 'findJQuerySapCalls.js');
      analyseMigrateAndTest(module, true, expectedContent, config, done, []);
    });

    it('Identify zIndex calls', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'zIndex.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(rootDir + 'zIndex.config.json', 'utf8')
      );
      const module = new CustomFileInfo(rootDir + 'zIndex.js');
      analyseMigrateAndTest(module, true, expectedContent, config, done, []);
    });

    it('Non zIndex calls', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'zIndexNoReplacement.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(rootDir + 'zIndexNoReplacement.config.json', 'utf8')
      );
      const module = new CustomFileInfo(rootDir + 'zIndexNoReplacement.js');
      analyseMigrateAndTest(module, false, expectedContent, config, done, []);
    });

    it('Invalid config, no finder found', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'findJQuerySapCalls.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(rootDir + 'invalidConfig.config.json', 'utf8')
      );
      const module = new CustomFileInfo(rootDir + 'findJQuerySapCalls.js');
      analyseMigrateAndTest(module, false, expectedContent, config, null, [])
        .then(() => {
          done(new Error('should not happen'));
        })
        .catch(oErr => {
          assert.equal(
            `Failed to find Finder for "JQueryFunctionExtensionFinder"`,
            oErr.message
          );
          done();
        });
    });

    it('find jQuery.sap.extend', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'findJQuerySapExtendCalls.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(
          rootDir + 'findJQuerySapExtendCalls.config.json',
          'utf8'
        )
      );
      const module = new CustomFileInfo(
        rootDir + 'findJQuerySapExtendCalls.js'
      );
      analyseMigrateAndTest(module, false, expectedContent, config, done, []);
    });

    it('find jQuery.sap functions', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'findJQuerySapFunctionCalls.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(
          rootDir + 'findJQuerySapFunctionCalls.config.json',
          'utf8'
        )
      );
      const module = new CustomFileInfo(
        rootDir + 'findJQuerySapFunctionCalls.js'
      );
      analyseMigrateAndTest(module, false, expectedContent, config, done, []);
    });

    it('invalid define (should not get modified)', function(done) {
      const expectedContent = fs.readFileSync(
        rootDir + 'invalidDefine.expected.js',
        'utf8'
      );
      const config = JSON.parse(
        fs.readFileSync(rootDir + 'invalidDefine.config.json', 'utf8')
      );
      const module = new CustomFileInfo(rootDir + 'invalidDefine.js');
      analyseMigrateAndTest(module, false, expectedContent, config, done, [
        'warning: unsupported sap.ui.define without factory found for ./test/addMissingDependencies/invalidDefine',
      ]);
    });
  });
});
