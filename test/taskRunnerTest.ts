import * as taskRunner from "../src/taskRunner";
import {MigrationTask} from "../src/taskRunner";
import * as replaceGlobals from "../src/tasks/replaceGlobals";
const fs = require("graceful-fs");
const sinon = require("sinon");

import {
	CustomFileFinder,
	CustomLocalFileInfo,
	CustomMetaReporter,
	CustomMigrationTask,
} from "./util/testUtils";
import {clearCache} from "../src/util/FlattenTaskArray";

const rootDir = "./test/taskRunner/";

const assert = require("assert");

describe("taskRunner", () => {
	it("should run tasks and modify files one after the other", () => {
		const fileSaved: string[] = [];
		const fileMigrated: string[] = [];
		const aTasks: MigrationTask[] = [];
		const customMigrationTask1 = new CustomMigrationTask();
		customMigrationTask1.addOnMigrateListener(args => {
			fileMigrated.push("task1:" + args.file.getFileName());
		});
		aTasks.push(customMigrationTask1);
		const customMigrationTask2 = new CustomMigrationTask();
		customMigrationTask2.addOnMigrateListener(args => {
			fileMigrated.push("task2:" + args.file.getFileName());
		});
		aTasks.push(customMigrationTask2);
		const aFileInfos = [];
		const customLocalFileInfo1 = new CustomLocalFileInfo(
			rootDir,
			"file1.js"
		);

		customLocalFileInfo1.addOnSaveListener(() => {
			fileSaved.push("file1");
		});
		const customLocalFileInfo2 = new CustomLocalFileInfo(
			rootDir,
			"file2.js"
		);
		customLocalFileInfo2.addOnSaveListener(() => {
			fileSaved.push("file2");
		});
		aFileInfos.push(customLocalFileInfo1);
		aFileInfos.push(customLocalFileInfo2);
		const customReporter = new CustomMetaReporter();
		const customFileFinder = new CustomFileFinder();
		return taskRunner
			.processModules(
				aTasks,
				aFileInfos,
				customReporter,
				customFileFinder,
				"",
				null,
				false
			)
			.then(() => {
				assert.deepEqual(
					fileSaved,
					["file1", "file2"],
					"files should be saved in correct order"
				);
				assert.deepEqual(
					fileMigrated,
					[
						"task1:file1",
						"task2:file1",
						"task1:file2",
						"task2:file2",
					],
					"files should be migrated in correct order"
				);
			});
	});

	it("should run migrate right after migrate before executing the next task", () => {
		const fileMigrated: string[] = [];

		const aTasks: MigrationTask[] = [];
		const customMigrationTask1 = new CustomMigrationTask();
		customMigrationTask1.addOnMigrateListener(args => {
			fileMigrated.push("migrate task1");
		});
		customMigrationTask1.addOnAnalyzeListener(args => {
			fileMigrated.push("analyze task1");
		});
		aTasks.push(customMigrationTask1);
		const customMigrationTask2 = new CustomMigrationTask();
		customMigrationTask2.addOnMigrateListener(args => {
			fileMigrated.push("migrate task2");
		});
		customMigrationTask2.addOnAnalyzeListener(args => {
			fileMigrated.push("analyze task2");
		});
		aTasks.push(customMigrationTask2);
		const aFileInfos = [];
		aFileInfos.push(new CustomLocalFileInfo(rootDir, "file1.js"));
		const customReporter = new CustomMetaReporter();
		const customFileFinder = new CustomFileFinder();
		return taskRunner
			.processModules(
				aTasks,
				aFileInfos,
				customReporter,
				customFileFinder,
				"",
				null,
				false
			)
			.then(() => {
				assert.deepEqual(
					fileMigrated,
					[
						"analyze task1",
						"migrate task1",
						"analyze task2",
						"migrate task2",
					],
					"files should be migrated in correct order"
				);
			});
	});

	it("should run post task after main task", () => {
		const replaceGlobalsTask = replaceGlobals as MigrationTask;
		const config = JSON.parse(
			fs.readFileSync(rootDir + "jquery0.config.json", "utf8")
		);

		clearCache();
		const oStub = sinon
			.stub(replaceGlobalsTask, "defaultConfig")
			.returns(Promise.resolve(config));

		const aTasks: MigrationTask[] = [];
		aTasks.push(replaceGlobalsTask);

		const aFileInfos = [];
		const module = new CustomLocalFileInfo(rootDir, "jquery0.js");
		aFileInfos.push(module);

		const expectedContent = fs.readFileSync(
			rootDir + "jquery0.expected.js",
			"utf8"
		);

		const customReporter = new CustomMetaReporter();
		const customFileFinder = new CustomFileFinder();

		return taskRunner
			.processModules(
				aTasks,
				aFileInfos,
				customReporter,
				customFileFinder,
				"",
				null,
				false
			)
			.then(aResult => {
				assert.equal(aResult.length, 1, "The file is modified");
				assert.equal(aResult[0].modifiedCode, expectedContent);
				oStub.restore();
			});
	});
});
