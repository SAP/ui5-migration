import {analyse, migrate} from "../src/tasks/fixTypeDependency";
import {ProcessingMode} from "../src/util/TypeDependencyUtil";

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
	expectedReports = [],
	level = "debug"
) {
	const reporter = new CustomReporter([], level);
	analyse({file: module, fileFinder, reporter, config})
		.then(analyseResult => {
			if (analyseResult && migrate) {
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

			if (expectedModification) {
				const actualContent = recast.print(module.getAST(), {
					lineTerminator: "\n",
					useTabs: true,
				}).code;
				assert.equal(actualContent, expectedContent);

				assert.deepStrictEqual(reporter.getReports(), expectedReports);
			}
		})
		.then(() => {
			done();
		})
		.catch(e => {
			done(e);
		});
}

describe("FixTypeDependency", () => {
	[
		{
			title: "should modify library file",
			sourceCodeFileName: "fixTypeDependency/library.js",
			expectedCodeFileName: "fixTypeDependency/library.expected.js",
			logs: [],
			amdSettings: {},
			api: {
				"sap.ui.table": rootDir + "fixTypeDependency/_table.api.json",
			},
		},
		{
			title: "should modify file with multiple library references",
			sourceCodeFileName: "fixTypeDependency/multipleLibraries.js",
			expectedCodeFileName:
				"fixTypeDependency/multipleLibraries.expected.js",
			logs: [],
			amdSettings: {},
			api: {
				"sap.ui.core": rootDir + "fixTypeDependency/_core.api.json",
				"sap.ui.layout": rootDir + "fixTypeDependency/_layout.api.json",
			},
		},
		{
			title: "should modify file with library namespaces references",
			sourceCodeFileName: "fixTypeDependency/libraryNamespace.js",
			expectedCodeFileName:
				"fixTypeDependency/libraryNamespace.expected.js",
			logs: [],
			amdSettings: {},
			api: {
				"sap.ui.table": rootDir + "fixTypeDependency/_table.api.json",
				"sap.ui.layout": rootDir + "fixTypeDependency/_layout.api.json",
			},
			executionMode: ProcessingMode.SEQUENTIAL,
		},
		{
			title: "Should not remove the library.js dependency",
			sourceCodeFileName: "fixTypeDependency/libraryDependency.js",
			modified: false,
			logs: [],
			amdSettings: {},
			api: {
				"sap.ui.core":
					rootDir + "fixTypeDependency/libraryDependency.api.json",
			},
			resource: {
				"sap.ui.core":
					rootDir + "fixTypeDependency/_core.resources.json",
			},
			executionMode: ProcessingMode.SEQUENTIAL,
		},
		{
			title: "Should ignore invalidDefine",
			sourceCodeFileName: "fixTypeDependency/invalidDefine.js",
			modified: false,
			logs: [],
			amdSettings: {},
			api: {
				"sap.ui.table": rootDir + "fixTypeDependency/_table.api.json",
			},
			executionMode: ProcessingMode.SEQUENTIAL,
		},
	].forEach(fixture => {
		const pathToApiVersionJSON =
			rootDir + "fixTypeDependency/_apiVersion.version.json";

		it(fixture.title, done => {
			const codeToBeMigrated = rootDir + fixture.sourceCodeFileName;
			const expectedContent =
				fixture.modified === false
					? undefined
					: fs.readFileSync(
							rootDir + fixture.expectedCodeFileName,
							"utf8"
					  );

			if (fixture.modified === undefined) {
				fixture.modified = true;
			}

			analyseMigrateAndTest(
				new CustomFileInfo(codeToBeMigrated),
				fixture.modified,
				expectedContent,
				{
					amd: fixture.amdSettings,
					api: fixture.api,
					apiResources: fixture.resource,
					apiVersion: pathToApiVersionJSON,
					executionMode: fixture.executionMode,
				},
				done,
				fixture.logs
			);
		});
	});
});
