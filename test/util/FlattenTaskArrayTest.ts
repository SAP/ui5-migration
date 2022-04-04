const assert = require("assert");
const sinon = require("sinon");

import {flattenTaskArray, clearCache} from "../../src/util/FlattenTaskArray";
import * as TaskRunner from "../../src/taskRunner";
import {CustomMigrationTask} from "./testUtils";

describe("FlattenTaskArray", () => {
	const task1 = new CustomMigrationTask();
	task1.keywords.push("task1");
	const task11 = new CustomMigrationTask();
	task11.keywords.push("task11");
	task1["postTasks"] = ["task11"];

	const task2 = new CustomMigrationTask();
	task2.keywords.push("task2");

	const task3 = new CustomMigrationTask();
	task3.keywords.push("task3");
	const task31 = new CustomMigrationTask();
	task31.keywords.push("task31");
	const task311 = new CustomMigrationTask();
	task311.keywords.push("task311");
	task31["postTasks"] = ["task311"];
	const task32 = new CustomMigrationTask();
	task32.keywords.push("task32");
	task3["postTasks"] = ["task31", "task32"];

	before(() => {
		// Clear the cache to remove the cached standard tasks
		clearCache();
		sinon.stub(TaskRunner, "getSupportedTasks").callsFake(() => {
			return Promise.resolve([
				task1,
				task2,
				task3,
				task11,
				task31,
				task32,
				task311,
			]);
		});
	});
	after(() => {
		sinon.restore();
	});

	it("Flatten all tasks", async () => {
		const aFlattenTasks = await flattenTaskArray([task1, task2, task3]);
		assert.deepEqual(aFlattenTasks, [
			task1,
			task11,
			task2,
			task3,
			task31,
			task311,
			task32,
		]);
	});

	it("Unknown post task doesn't lead to error", async () => {
		task2["postTasks"] = ["unknown_postTask"];

		const aFlattenTasks = await flattenTaskArray([task2, task3]);
		assert.deepEqual(aFlattenTasks, [
			task2,
			task3,
			task31,
			task311,
			task32,
		]);
	});
});
