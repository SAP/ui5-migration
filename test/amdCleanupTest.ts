import {ReportLevel} from "../src/reporter/Reporter";
import {analyse, migrate} from "../src/tasks/amdCleanup";
import {FileFinder} from "../src/util/FileFinder";
import * as LoaderUtils from "../src/util/LoaderUtils";

import {
	CustomFileFinder,
	CustomFileInfo,
	CustomReporter,
} from "./util/testUtils";

const fs = require("graceful-fs");
const recast = require("recast");
const assert = require("assert");
const rootDir = "./test/";

const fileFinder = new CustomFileFinder();

function analyseMigrateAndTest(
	module: CustomFileInfo,
	expectedModification: boolean,
	expectedContent: string,
	config: {},
	done: Function,
	expectedReports: string[] = [],
	level = ReportLevel.DEBUG,
	oOutputFormat: {} = {}
) {
	const reporter = new CustomReporter([], level);
	analyse({file: module, fileFinder, reporter, config})
		.then(analyseResult => {
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
		.then(didModify => {
			assert.strictEqual(
				didModify,
				expectedModification,
				"file modification not as expected"
			);
			oOutputFormat = Object.assign(
				{useTabs: true, lineTerminator: "\n"},
				oOutputFormat
			);
			const actualContent = recast.print(
				module.getAST(),
				oOutputFormat
			).code;
			assert.equal(actualContent, expectedContent);

			assert.deepStrictEqual(reporter.getReports(), expectedReports);
		})
		.then(() => {
			done();
		})
		.catch(e => {
			done(e);
		});
}

describe("AmdCleaner ui52amd", () => {
	before(() => {
		LoaderUtils.resetCache();
	});

	after(() => {
		LoaderUtils.resetCache();
	});

	[
		{
			title: "should handle declare and require",
			sourceCodeFileName: "amdCleanup/declareAndRequire.js",
			expectedCodeFileName: "amdCleanup/declareAndRequire.expected.js",
			logs: [
				"debug: 1: remove jQuery.sap.declare(sap.m.sample.TimePicker.Component)",
				"debug: 2: jQuery.sap.require(sap.ui.core.Core)",
				"debug: 28: jQuery.sap.require(sap.ui.core.EnabledPropagator)",
				"debug: 1: Create empty define call",
				"debug: 1: remove jQuery.sap.declare(sap.m.sample.TimePicker.Component)",
				"debug: 4: Added variable declaration component",
				"debug: 2: jQuery.sap.require(sap.ui.core.Core)",
				"debug:   add import Core <= sap/ui/core/Core",
				"debug: 2:   transformed to dependencies: jQuery.sap.require(sap.ui.core.Core)",
				"debug:   add import Component <= sap/ui/core/Component",
				"debug: 4: Add dependency for sap.ui.core.Component",
				"debug: 4:   replace sap.ui.core.Component with Component",
				"debug: 4: Replace occurrence of Component",
				"debug: 28: jQuery.sap.require(sap.ui.core.EnabledPropagator)",
				"debug:   add import EnabledPropagator <= sap/ui/core/EnabledPropagator",
				"debug: 28:   transformed to dependencies: jQuery.sap.require(sap.ui.core.EnabledPropagator)",
				"debug: Added return statement of component",
				"debug: Added true for global export",
			],
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "Should not include already included relative dependency (avoid duplicate dependencies)",
			sourceCodeFileName: "amdCleanup/relative.js",
			expectedCodeFileName: "amdCleanup/relative.expected.js",
			apiFileName: "amdCleanup/relative.api.json",
			namespaces: [
				{namespace: "sap.ui.core", filePath: rootDir + "amdCleanup"},
			],
			logs: [
				"debug: found define call at position 0",
				"debug: found define call at position 0",
				"debug: 12: Add dependency for sap.ui.core.AbsoluteCSSSize",
				"debug: 12: Add shortcut",
				"debug: 12:   replace sap.ui.core.AbsoluteCSSSize with AbsoluteCSSSize",
				"debug: 12: Replace occurrence of AbsoluteCSSSize",
			],
			amdSettings: {
				addTodoForUnsafeReplacements: false,
				onlySafeReplacements: false,
			},
		},
		{
			title: "Should not include self as dependency (avoid circular dependency)",
			sourceCodeFileName: "amdCleanup/library.js",
			expectedCodeFileName: "amdCleanup/library.expected.js",
			apiFileName: "amdCleanup/library.api.json",
			namespaces: [
				{namespace: "sap.ui.core", filePath: rootDir + "amdCleanup"},
			],
			logs: [
				"debug: found define call at position 0",
				"debug: found define call at position 0",
				"debug:   ignoring dependency to self",
				"debug: 44: Add dependency for sap.ui.core",
				"debug:   add import AnnotationHelper <= sap/ui/model/odata/AnnotationHelper",
				"debug: 59: Add dependency for sap.ui.model.odata.AnnotationHelper",
				"debug: 59:   replace sap.ui.model.odata.AnnotationHelper with AnnotationHelper",
				"debug: 59: Replace occurrence of AnnotationHelper",
				"debug:   ignoring dependency to self",
				"debug: 68: Add dependency for sap.ui.core",
			],
			amdSettings: {
				addTodoForUnsafeReplacements: false,
				onlySafeReplacements: false,
			},
		},
		{
			title: "should handle modelFilter",
			sourceCodeFileName: "amdCleanup/modelFilter.js",
			expectedCodeFileName: "amdCleanup/modelFilter.expected.js",
			apiFileName: "amdCleanup/modelFilter.api.json",
			logs: [
				"debug: found define call at position 0",
				"debug:   found class method: x.prototype.a",
				"debug: found define call at position 0",
				"debug:   found class method: x.prototype.a",
				"debug:   add import Filter <= sap/ui/model/Filter",
				"debug: 9: Add dependency for sap.ui.model.Filter",
				"debug: 9:   replace sap.ui.model.Filter with Filter",
				"debug: 9: Replace occurrence of Filter",
			],
			amdSettings: {
				addTodoForUnsafeReplacements: false,
				onlySafeReplacements: false,
			},
		},
		{
			title: "should modify an empty file",
			sourceCodeFileName: "amdCleanup/emptyFile.js",
			expectedCodeFileName: "amdCleanup/emptyFile.expected.js",
			logs: ["debug: 1: Create empty define call"],
			amdSettings: {},
		},
		{
			title: "should modify an empty file",
			sourceCodeFileName: "amdCleanup/emptyFile.js",
			expectedCodeFileName: "amdCleanup/emptyFile.expected.js",
			logs: ["debug: 1: Create empty define call"],
			amdSettings: {},
		},
		{
			title: "Adds strict mode for amd iife replacer",
			sourceCodeFileName: "amdCleanup/iifeWrapper.js",
			expectedCodeFileName: "amdCleanup/iifeWrapper.expected.js",
			logs: ["debug: 1: Create empty define call"],
			amdSettings: {},
		},
		{
			title: "should modify a single statement",
			sourceCodeFileName: "amdCleanup/singleStatement.js",
			expectedCodeFileName: "amdCleanup/singleStatement.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: found define call at position 0",
				"debug:   add import Component <= sap/ui/core/Component",
				"debug: 2: Add dependency for sap.ui.core.Component",
				"debug: 2:   replace sap.ui.core.Component with Component",
				"debug: 2: Replace occurrence of Component",
			],
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "should modify two statements",
			sourceCodeFileName: "amdCleanup/twoStatements.js",
			expectedCodeFileName: "amdCleanup/twoStatements.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: found define call at position 0",
				"debug:   add import Component <= sap/ui/core/Component",
				"debug: 2: Add dependency for sap.ui.core.Component",
				"debug: 2:   replace sap.ui.core.Component with Component",
				"debug: 2: Replace occurrence of Component",
				"debug: 3: Add dependency for sap.ui.core.Component",
				"debug: 3:   replace sap.ui.core.Component with Component",
				"debug: 3: Replace occurrence of Component",
			],
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "should add comments",
			sourceCodeFileName: "amdCleanup/addComments.js",
			expectedCodeFileName: "amdCleanup/addComments.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug:   found class method: x.prototype.a",
				"debug: found define call at position 0",
				"debug:   found class method: x.prototype.a",
				"debug:   add import Component <= sap/ui/core/Component",
				"debug: 6: Add dependency for sap.ui.core.Component",
				"debug: 6:   replace sap.ui.core.Component with Component",
				"debug: 6: Replace occurrence of Component",
			],
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "should handle declare",
			sourceCodeFileName: "amdCleanup/declare.js",
			expectedCodeFileName: "amdCleanup/declare.expected.js",
			logs: [
				"debug: 1: remove jQuery.sap.declare(esap.m.sample.TimePicker.Component)",
				"debug: 1: Create empty define call",
				"debug: 1: remove jQuery.sap.declare(esap.m.sample.TimePicker.Component)",
				"debug: 3: Added variable declaration component",
				"debug:   add import Component <= sap/ui/core/Component",
				"debug: 3: Add dependency for sap.ui.core.Component",
				"debug: 3:   replace sap.ui.core.Component with Component",
				"debug: 3: Replace occurrence of Component",
				"debug: Added return statement of component",
				"debug: Added true for global export",
			],
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "should handle declare2",
			sourceCodeFileName: "amdCleanup/declare2.js",
			expectedCodeFileName: "amdCleanup/declare2.expected.js",
			logs: [
				"debug: 10: remove jQuery.sap.declare(esap.mu.i.core.Component)",
				"debug: 1: Create empty define call",
				"debug: 10: remove jQuery.sap.declare(esap.mu.i.core.Component)",
				"debug: 11: Added variable component",
				"debug: 14: Replace using variable component",
				"debug: 15: Replace using variable component",
				"debug: 16: Replace using variable component",
				"debug: 17: Replace using variable component",
				"debug: 20: Replace using variable component",
				"debug:   add import ManagedObject <= sap/ui/base/ManagedObject",
				"debug: 18: Add dependency for sap.ui.base.ManagedObject",
				"debug: 18:   replace sap.ui.base.ManagedObject with ManagedObject",
				"debug: 18: Replace occurrence of ManagedObject",
				"debug: 20: Added return statement of component",
				"debug: 20: Added true for global export",
			],
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "should handle functionOnly",
			sourceCodeFileName: "amdCleanup/functionOnly.js",
			expectedCodeFileName: "amdCleanup/functionOnly.expected.js",
			logs: [
				"debug:   found class method: x.prototype.a",
				"debug: 1: Create empty define call",
				"debug:   found class method: x.prototype.a",
				"debug:   add import Component <= sap/ui/core/Component",
				"debug: 6: Add dependency for sap.ui.core.Component",
				"debug: 6:   replace sap.ui.core.Component with Component",
				"debug: 6: Replace occurrence of Component",
			],
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "should handle require",
			sourceCodeFileName: "amdCleanup/require.js",
			expectedCodeFileName: "amdCleanup/require.expected.js",
			logs: [
				"debug: 1: jQuery.sap.require(sap.ui.core.Component)",
				"debug: 1: Create empty define call",
				"debug: 1: jQuery.sap.require(sap.ui.core.Component)",
				"debug:   add import Component <= sap/ui/core/Component",
				"debug: 1:   transformed to dependencies: jQuery.sap.require(sap.ui.core.Component)",
				"debug: 5: Add dependency for sap.ui.core.Component",
				"debug: 5:   replace sap.ui.core.Component with Component",
				"debug: 5: Replace occurrence of Component",
			],
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "should handle existingImport",
			sourceCodeFileName: "amdCleanup/existingImport.js",
			expectedCodeFileName: "amdCleanup/existingImport.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: found define call at position 0",
				"debug: 2: Add dependency for sap.ui.core.Component",
				"debug: 2:   replace sap.ui.core.Component with Component",
				"debug: 2: Replace occurrence of Component",
			],
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "should handle emptyDefine",
			sourceCodeFileName: "amdCleanup/emptyDefine.js",
			expectedCodeFileName: "amdCleanup/emptyDefine.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: found define call at position 0",
			],
			modified: false,
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "should handle iife with jQuery.sap.declare correctly",
			sourceCodeFileName: "amdCleanup/iife.js",
			expectedCodeFileName: "amdCleanup/iife.expected.js",
			logs: [
				"debug: 1: remove jQuery.sap.declare(ns.NavigationMixin)",
				"debug: 2: jQuery.sap.require(sap.m.Button)",
				"debug: 1: Create empty define call",
				"debug: 1: remove jQuery.sap.declare(ns.NavigationMixin)",
				"debug: 7: Added variable navigationMixin",
				"debug: 2: jQuery.sap.require(sap.m.Button)",
				"debug:   add import Button <= sap/m/Button",
				"debug: 2:   transformed to dependencies: jQuery.sap.require(sap.m.Button)",
				"debug: Added return statement of navigationMixin",
				"debug: Added true for global export",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "Should handle duplicate variables (duplicateVar)",
			sourceCodeFileName: "amdCleanup/duplicateVar.js",
			expectedCodeFileName: "amdCleanup/duplicateVar.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: found define call at position 0",
			],
			modified: false,
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "Dashed imports (dashedImports)",
			sourceCodeFileName: "amdCleanup/dashedImports.js",
			expectedCodeFileName: "amdCleanup/dashedImports.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: 1: jQuery.sap.require(sap.ui.thirdparty.jqueryui.jquery-ui-core)",
				"debug: found define call at position 0",
				"debug: 1: jQuery.sap.require(sap.ui.thirdparty.jqueryui.jquery-ui-core)",
				"debug:   add import jqueryUiCore <= sap/ui/thirdparty/jqueryui/jquery-ui-core",
				"debug: 1:   transformed to dependencies: jQuery.sap.require(sap.ui.thirdparty.jqueryui.jquery-ui-core)",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "Dashed imports simple",
			sourceCodeFileName: "amdCleanup/dashedImportsSimple.js",
			expectedCodeFileName: "amdCleanup/dashedImportsSimple.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: 1: jQuery.sap.require(sap.ui.thirdparty.jqueryui.jquery-ui-core)",
				"debug: found define call at position 0",
				"debug: 1: jQuery.sap.require(sap.ui.thirdparty.jqueryui.jquery-ui-core)",
				"debug:   add import jqueryUiCore <= sap/ui/thirdparty/jqueryui/jquery-ui-core",
				"debug: 1:   transformed to dependencies: jQuery.sap.require(sap.ui.thirdparty.jqueryui.jquery-ui-core)",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "memberExpression",
			sourceCodeFileName: "amdCleanup/memberExpression.js",
			expectedCodeFileName: "amdCleanup/memberExpression.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: 9: remove jQuery.sap.declare(sap.mu.shell.Container.getService)",
				"debug: found define call at position 0",
				"debug: 9: remove jQuery.sap.declare(sap.mu.shell.Container.getService)",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "memberExpression top",
			sourceCodeFileName: "amdCleanup/memberExpressionTop.js",
			expectedCodeFileName: "amdCleanup/memberExpressionTop.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: 7: remove jQuery.sap.declare(sap.mu.shell.Container.getService)",
				"debug: found define call at position 0",
				"debug: 7: remove jQuery.sap.declare(sap.mu.shell.Container.getService)",
				"debug: 8: Added variable getService",
				"debug: 9: Added return statement of getService",
				"debug: 9: Added true for global export",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "There should be no duplicate var (varvar)",
			sourceCodeFileName: "amdCleanup/varvar.js",
			expectedCodeFileName: "amdCleanup/varvar.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug:   found class method: oSuccessHandler.prototype.successMessagePopover",
				"debug: found define call at position 0",
				"debug:   found class method: oSuccessHandler.prototype.successMessagePopover",
				"debug:   add import JSONModel <= sap/ui/model/json/JSONModel",
				"debug: 11: Add dependency for sap.ui.model.json.JSONModel",
				"debug: 11:   replace sap.ui.model.json.JSONModel with JSONModel",
				"debug: 11: Replace occurrence of JSONModel",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: false,
				onlySafeReplacements: false,
			},
			api: {"sap.ui.core": rootDir + "amdCleanup/varvar.api.json"},
		},
		{
			title: "sap.ui.model.type.Date should be replaced correctly",
			sourceCodeFileName: "amdCleanup/dateType.js",
			expectedCodeFileName: "amdCleanup/dateType.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: found define call at position 0",
				"debug:   add import TypeDate <= sap/ui/model/type/Date",
				"debug: 11: Add dependency for sap.ui.model.type.Date",
				"debug: 11:   replace sap.ui.model.type.Date with TypeDate",
				"debug: 11: Replace occurrence of TypeDate",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: false,
				onlySafeReplacements: false,
			},
			api: {"sap.ui.core": rootDir + "amdCleanup/dateType.api.json"},
		},
		{
			title: "duplicate Export variable (duplicateExportVar)",
			sourceCodeFileName: "amdCleanup/duplicateExportVar.js",
			expectedCodeFileName: "amdCleanup/duplicateExportVar.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: found define call at position 0",
				"debug:   add import JSONModel <= sap/ui/model/json/JSONModel",
				"debug: 6: Add dependency for sap.ui.model.json.JSONModel",
				"debug: 6:   replace sap.ui.model.json.JSONModel with JSONModel",
				"debug: 6: Replace occurrence of JSONModel",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: false,
				onlySafeReplacements: false,
			},
			api: {
				"sap.ui.core":
					rootDir + "amdCleanup/duplicateExportVar.api.json",
			},
		},
		{
			title: "Model should be properly returned",
			sourceCodeFileName: "amdCleanup/ModelReturnModule.js",
			expectedCodeFileName: "amdCleanup/ModelReturnModule.expected.js",
			logs: [
				"debug: 1: jQuery.sap.require(sap.m.MessageBox)",
				"debug: 1: Create empty define call",
				"debug: 3: Added variable declaration applicationModel",
				"debug: 1: jQuery.sap.require(sap.m.MessageBox)",
				"debug:   add import MessageBox <= sap/m/MessageBox",
				"debug: 1:   transformed to dependencies: jQuery.sap.require(sap.m.MessageBox)",
				"debug:   add import JSONModel <= sap/ui/model/json/JSONModel",
				"debug: 3: Add dependency for sap.ui.model.json.JSONModel",
				"debug: 3:   replace sap.ui.model.json.JSONModel with JSONModel",
				"debug: 3: Replace occurrence of JSONModel",
				"debug: Added return statement of applicationModel",
				"debug: Added true for global export",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
			api: {
				"sap.ui.core":
					rootDir + "amdCleanup/ModelReturnModule.api.json",
			},
		},
		{
			title: "Complex Model should be properly returned",
			sourceCodeFileName: "amdCleanup/ModelReturnModuleAdv.js",
			expectedCodeFileName: "amdCleanup/ModelReturnModuleAdv.expected.js",
			logs: [
				"debug: 1: jQuery.sap.require(sap.m.MessageBox)",
				"debug: 1: Create empty define call",
				"debug: 3: Added variable declaration applicationModel",
				"debug: 7: Replace using variable applicationModel",
				"debug: 8: Replace using variable applicationModel",
				"debug: 1: jQuery.sap.require(sap.m.MessageBox)",
				"debug:   add import MessageBox <= sap/m/MessageBox",
				"debug: 1:   transformed to dependencies: jQuery.sap.require(sap.m.MessageBox)",
				"debug:   add import JSONModel <= sap/ui/model/json/JSONModel",
				"debug: 3: Add dependency for sap.ui.model.json.JSONModel",
				"debug: 3:   replace sap.ui.model.json.JSONModel with JSONModel",
				"debug: 3: Replace occurrence of JSONModel",
				"debug: 8: Added return statement of applicationModel",
				"debug: 8: Added true for global export",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
			api: {
				"sap.ui.core":
					rootDir + "amdCleanup/ModelReturnModule.api.json",
			},
		},
		{
			title: "Components should be properly returned",
			sourceCodeFileName: "amdCleanup/ComponentReturnModule.js",
			expectedCodeFileName:
				"amdCleanup/ComponentReturnModule.expected.js",
			logs: [
				"debug: 1: remove jQuery.sap.declare(mine.Component)",
				"debug: 3: jQuery.sap.require(sap.ui.generic.app.AppComponent)",
				"debug: 1: Create empty define call",
				"debug: 1: remove jQuery.sap.declare(mine.Component)",
				"debug: 5: Added variable declaration component",
				"debug: 3: jQuery.sap.require(sap.ui.generic.app.AppComponent)",
				"debug:   add import AppComponent <= sap/ui/generic/app/AppComponent",
				"debug: 3:   transformed to dependencies: jQuery.sap.require(sap.ui.generic.app.AppComponent)",
				"debug: 5: Add dependency for sap.ui.generic.app.AppComponent",
				"debug: 5:   replace sap.ui.generic.app.AppComponent with AppComponent",
				"debug: 5: Replace occurrence of AppComponent",
				"debug: Added return statement of component",
				"debug: Added true for global export",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
			api: {
				"sap.ui.generic.app":
					rootDir + "amdCleanup/genericApp.api.json",
			},
			apiResources: {
				"sap.ui.generic.app":
					rootDir + "amdCleanup/genericApp.resources.json",
			},
			apiVersion: {
				name: "SAPUI5 Distribution",
				version: "1.63.0-SNAPSHOT",
				buildTimestamp: "201902110319",
				scmRevision: "05c8c23fe4ab5bf13ebf5772260155a27b0875e7",
				gav: "com.sap.ui5.dist:sapui5-sdk-dist:1.63.0-SNAPSHOT:war",
				libraries: [
					{name: "sap.ui.core"},
					{name: "sap.ui.generic.app"},
				],
			},
		},
		{
			title: "Complex components should be properly returned",
			sourceCodeFileName: "amdCleanup/ComponentReturnModuleAdv.js",
			expectedCodeFileName:
				"amdCleanup/ComponentReturnModuleAdv.expected.js",
			logs: [
				"debug: 1: remove jQuery.sap.declare(mine.Component)",
				"debug: 3: jQuery.sap.require(sap.ui.generic.app.AppComponent)",
				"debug: 1: Create empty define call",
				"debug: 1: remove jQuery.sap.declare(mine.Component)",
				"debug: 5: Added variable declaration component",
				"debug: 11: Replace using variable component",
				"debug: 3: jQuery.sap.require(sap.ui.generic.app.AppComponent)",
				"debug:   add import AppComponent <= sap/ui/generic/app/AppComponent",
				"debug: 3:   transformed to dependencies: jQuery.sap.require(sap.ui.generic.app.AppComponent)",
				"debug: 5: Add dependency for sap.ui.generic.app.AppComponent",
				"debug: 5:   replace sap.ui.generic.app.AppComponent with AppComponent",
				"debug: 5: Replace occurrence of AppComponent",
				"debug: 11: Added return statement of component",
				"debug: 11: Added true for global export",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
			api: {
				"sap.ui.generic.app":
					rootDir + "amdCleanup/genericApp.api.json",
			},
			apiResources: {
				"sap.ui.generic.app":
					rootDir + "amdCleanup/genericApp.resources.json",
			},
			apiVersion: {
				name: "SAPUI5 Distribution",
				version: "1.63.0-SNAPSHOT",
				buildTimestamp: "201902110319",
				scmRevision: "05c8c23fe4ab5bf13ebf5772260155a27b0875e7",
				gav: "com.sap.ui5.dist:sapui5-sdk-dist:1.63.0-SNAPSHOT:war",
				libraries: [
					{name: "sap.ui.core"},
					{name: "sap.ui.generic.app"},
				],
			},
		},
		{
			title: "Dependencys should ne kept, also when they are not used",
			sourceCodeFileName: "amdCleanup/keepDependency.js",
			expectedCodeFileName: "amdCleanup/keepDependency.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: found define call at position 0",
				"debug: 8: Added variable declaration controller",
				"debug: Added return statement of controller",
				"debug: Added true for global export",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: false,
				onlySafeReplacements: true,
				removeUnusedDependencies: false,
			},
		},
		{
			title: "declare with explicit global own module (self)",
			sourceCodeFileName:
				"amdCleanup/declareWithExplicitGlobalReference.js",
			expectedCodeFileName:
				"amdCleanup/declareWithExplicitGlobalReference.expected.js",
			logs: [
				"debug: 2: remove jQuery.sap.declare(sap.m.sample.TimePicker.Component)",
				"debug: 1: jQuery.sap.require(sap/m/Button)",
				"debug: 1: Create empty define call",
				"debug: 2: remove jQuery.sap.declare(sap.m.sample.TimePicker.Component)",
				"debug: 4: Added variable component",
				"debug: 9: Replace using variable component",
				"debug: 13: Replace using variable component",
				"debug: 1: jQuery.sap.require(sap/m/Button)",
				"debug:   add import Button <= sap/m/Button",
				"debug: 1:   transformed to dependencies: jQuery.sap.require(sap/m/Button)",
				"debug: 13: Added return statement of component",
				"debug: 13: Added true for global export",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "one extend call",
			sourceCodeFileName: "amdCleanup/oneExtendCall.js",
			expectedCodeFileName: "amdCleanup/oneExtendCall.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: found define call at position 0",
				"debug:   add import Component <= sap/ui/core/Component",
				"debug: 16: Add dependency for sap.ui.core.Component",
				"debug: 16:   replace sap.ui.core.Component with Component",
				"debug: 16: Replace occurrence of Component",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: false,
				onlySafeReplacements: false,
			},
		},
		{
			title: "Comments should not be removed",
			sourceCodeFileName: "amdCleanup/comments.js",
			expectedCodeFileName: "amdCleanup/comments.expected.js",
			logs: [
				"debug: 1: remove jQuery.sap.declare(sap.m.sample.TimePicker.Component)",
				"debug: 1: Create empty define call",
				"debug: 1: remove jQuery.sap.declare(sap.m.sample.TimePicker.Component)",
				"debug: 8: Added variable component",
				"debug: Added return statement of component",
				"debug: Added true for global export",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: false,
				onlySafeReplacements: true,
				removeUnusedDependencies: false,
			},
		},
		{
			title: "reserved keywords",
			sourceCodeFileName: "amdCleanup/reservedKeywords.js",
			expectedCodeFileName: "amdCleanup/reservedKeywords.expected.js",
			logs: [
				"debug: 1: remove jQuery.sap.declare(sap.m.sample.TimePicker.const)",
				"debug: 1: Create empty define call",
				"debug: 1: remove jQuery.sap.declare(sap.m.sample.TimePicker.const)",
				"debug: 3: Added variable timePickerConst",
				"debug: Added return statement of timePickerConst",
				"debug: Added true for global export",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "jsdoc declare",
			sourceCodeFileName: "amdCleanup/jsdocDeclare.js",
			expectedCodeFileName: "amdCleanup/jsdocDeclare.expected.js",
			logs: [
				"debug: 9: remove jQuery.sap.declare(myfn)",
				"debug: 1: Create empty define call",
				"debug: 9: remove jQuery.sap.declare(myfn)",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: false,
				onlySafeReplacements: false,
			},
		},
		{
			title: "property",
			sourceCodeFileName: "amdCleanup/property.js",
			expectedCodeFileName: "amdCleanup/property.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: Remove unused import my/unused/dependency (dependency)",
				"debug: found define call at position 0",
				"debug:   add import JSONModel <= sap/ui/model/json/JSONModel",
				"debug: 10: Add dependency for sap.ui.model.json.JSONModel",
				"debug: 10:   replace sap.ui.model.json.JSONModel with JSONModel",
				"debug: 10: Replace occurrence of JSONModel",
				"debug: Remove unused import my/unused/dependency (dependency)",
				"debug: 1: Remove dependency",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: false,
				onlySafeReplacements: false,
				removeUnusedDependencies: true,
			},
			api: {"sap.ui.core": rootDir + "amdCleanup/property.api.json"},
		},
		{
			title: "duplicate imports",
			sourceCodeFileName: "amdCleanup/duplicateImports.js",
			expectedCodeFileName: "amdCleanup/duplicateImports.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: Remove unused import hpa/cei/mktplan/gantt/settings (ganttSettings)",
				"debug: Remove unused import my/unused/dependency (dependency)",
				"debug: found define call at position 0",
				"debug:   add import JSONModel <= sap/ui/model/json/JSONModel",
				"debug: 11: Add dependency for sap.ui.model.json.JSONModel",
				"debug: 11:   replace sap.ui.model.json.JSONModel with JSONModel",
				"debug: 11: Replace occurrence of JSONModel",
				"debug: Remove unused import hpa/cei/mktplan/gantt/settings (ganttSettings)",
				"debug: 1: Remove dependency",
				"debug: Remove unused import my/unused/dependency (dependency)",
				"debug: 1: Remove dependency",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: false,
				onlySafeReplacements: false,
				removeUnusedDependencies: true,
			},
			api: {
				"sap.ui.core": rootDir + "amdCleanup/duplicateImports.api.json",
			},
		},
		{
			title: "reserved modules (excludes)",
			sourceCodeFileName: "amdCleanup/excludes.js",
			expectedCodeFileName: "amdCleanup/excludes.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: found define call at position 0",
				"debug:   add import ManagedObject <= sap/ui/base/ManagedObject",
				"debug: 19: Add dependency for sap.ui.base.ManagedObject",
				"debug: 19:   replace sap.ui.base.ManagedObject with ManagedObject",
				"debug: 19: Replace occurrence of ManagedObject",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
				excludes: ["sap.ui.loader", "sap.ushell"],
			},
			api: {
				"sap.ui.core": rootDir + "amdCleanup/excludes.api.json",
				"sap.ushell": rootDir + "amdCleanup/excludes.ushell.api.json",
			},
			apiVersion: {
				name: "SAPUI5 Distribution",
				version: "1.63.0-SNAPSHOT",
				buildTimestamp: "201902110319",
				scmRevision: "05c8c23fe4ab5bf13ebf5772260155a27b0875e7",
				gav: "com.sap.ui5.dist:sapui5-sdk-dist:1.63.0-SNAPSHOT:war",
				libraries: [{name: "sap.ui.core"}, {name: "sap.ushell"}],
			},
		},
		{
			title: "objectPath",
			sourceCodeFileName: "amdCleanup/objectPath.js",
			expectedCodeFileName: "amdCleanup/objectPath.expected.js",
			logs: [
				"debug: 3: remove jQuery.sap.declare(hpa.cei.customerjourneyinsight.s4.core.Const)",
				"debug: 1: Create empty define call",
				"debug: 3: remove jQuery.sap.declare(hpa.cei.customerjourneyinsight.s4.core.Const)",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
		},
		{
			title: "plain module name without slashes plainModuleName",
			sourceCodeFileName: "amdCleanup/plainModuleName.js",
			expectedCodeFileName: "amdCleanup/plainModuleName.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug:   found class method: oSuccessHandler.prototype.successMessagePopover",
				"debug: found define call at position 0",
				"debug:   found class method: oSuccessHandler.prototype.successMessagePopover",
				"debug:   add import myModule <= myModule",
				"debug: 11: Add dependency for my.Module",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: false,
				onlySafeReplacements: false,
			},
			api: {
				"sap.ui.core": rootDir + "amdCleanup/plainModuleName.api.json",
			},
		},
		{
			title: "existing variable names (existingVariables)",
			sourceCodeFileName: "amdCleanup/existingVariables.js",
			expectedCodeFileName: "amdCleanup/existingVariables.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: 6: remove jQuery.sap.declare(hpa.cei.amp.plan.core.ApplicationContext)",
				"debug: found define call at position 0",
				"debug: 6: remove jQuery.sap.declare(hpa.cei.amp.plan.core.ApplicationContext)",
				"debug: 13: Added variable coreApplicationContext",
				"debug: 14: Added true for global export",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: false,
				onlySafeReplacements: false,
			},
		},
		{
			title: "invalid define (invalidDefine)",
			sourceCodeFileName: "amdCleanup/invalidDefine.js",
			expectedCodeFileName: "amdCleanup/invalidDefine.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: found define call at position 0",
			],
			modified: false,
			amdSettings: {
				addTodoForUnsafeReplacements: false,
				onlySafeReplacements: false,
			},
		},
		{
			title: "empty define with content (emptyDefineWithContent)",
			sourceCodeFileName: "amdCleanup/emptyDefineWithContent.js",
			expectedCodeFileName:
				"amdCleanup/emptyDefineWithContent.expected.js",
			logs: [
				"debug: found define call at position 0",
				"debug: found define call at position 0",
				"debug:   add import JSONModel <= sap/ui/model/json/JSONModel",
				"debug: 8: Add dependency for sap.ui.model.json.JSONModel",
				"debug: 8:   replace sap.ui.model.json.JSONModel with JSONModel",
				"debug: 8: Replace occurrence of JSONModel",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: false,
				onlySafeReplacements: false,
			},
			api: {
				"sap.ui.core":
					rootDir + "amdCleanup/emptyDefineWithContent.api.json",
			},
		},
		{
			title: "Model should be properly returned outputformat",
			sourceCodeFileName: "amdCleanup/ModelReturnModuleFormat.js",
			expectedCodeFileName:
				"amdCleanup/ModelReturnModuleFormat.expected.js",
			logs: [
				"debug: 1: jQuery.sap.require(sap.m.MessageBox)",
				"debug: 1: Create empty define call",
				"debug: 3: Added variable declaration applicationModel",
				"debug: 1: jQuery.sap.require(sap.m.MessageBox)",
				"debug:   add import MessageBox <= sap/m/MessageBox",
				"debug: 1:   transformed to dependencies: jQuery.sap.require(sap.m.MessageBox)",
				"debug:   add import JSONModel <= sap/ui/model/json/JSONModel",
				"debug: 3: Add dependency for sap.ui.model.json.JSONModel",
				"debug: 3:   replace sap.ui.model.json.JSONModel with JSONModel",
				"debug: 3: Replace occurrence of JSONModel",
				"debug: Added return statement of applicationModel",
				"debug: Added true for global export",
			],
			modified: true,
			amdSettings: {
				addTodoForUnsafeReplacements: true,
				onlySafeReplacements: false,
			},
			api: {
				"sap.ui.core":
					rootDir + "amdCleanup/ModelReturnModuleFormat.api.json",
			},
			oOutputFormat: {
				tabWidth: 4,
				useTabs: true,
				reuseWhitespace: true,
				lineTerminator: "\n",
				wrapColumn: 120,
				quote: "double",
			},
		},
	].forEach(fixture => {
		const pathToApiJSON =
			rootDir +
			(fixture.apiFileName
				? fixture.apiFileName
				: "amdCleanup/_generic.api.json");

		it(fixture.title, done => {
			const sourceCodeFile = rootDir + fixture.sourceCodeFileName;
			const expectedContent = fs.readFileSync(
				rootDir + fixture.expectedCodeFileName,
				"utf8"
			);

			const apiDefault = {"sap.ui.core": pathToApiJSON};
			/*
			 * calculate namespace of file
			 */
			let namespace = "";
			if (fixture.namespaces) {
				namespace = FileFinder.getNamespace(
					sourceCodeFile,
					fixture.namespaces
				);
			}
			analyseMigrateAndTest(
				new CustomFileInfo(sourceCodeFile, namespace),
				fixture.modified === undefined ? true : fixture.modified,
				expectedContent,
				{
					amd: fixture.amdSettings,
					api: Object.assign(apiDefault, fixture.api),
					apiResources: Object.assign({}, fixture.apiResources),
					apiVersion: Object.assign({}, fixture.apiVersion),
				},
				done,
				fixture.logs,
				undefined,
				fixture.oOutputFormat
			);
		});
	});
});
