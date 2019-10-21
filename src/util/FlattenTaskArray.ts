import {getSupportedTasks, MigrationTask} from "../taskRunner";

let taskCache: MigrationTask[] = [];

export function clearCache() {
	taskCache = [];
}

function _flattenTask(oTask: MigrationTask): MigrationTask[] {
	// if the given keyword in postTasks array can't be matched to
	// an existing supported task, an empty array is returned
	if (!oTask) {
		return [];
	}

	const aTasks: MigrationTask[] = [];
	aTasks.push(oTask);

	if (oTask.postTasks) {
		// convert the array of keywords to an array of MigrationTask
		const aPostTasks = oTask.postTasks.map(
			(sKeyword: string): MigrationTask => {
				return taskCache.find((oTask: MigrationTask): boolean => {
					return oTask.keywords.includes(sKeyword);
				});
			}
		);

		// flatten each of the post tasks recursively and push the result to the
		// return value of this function
		aPostTasks.forEach((oPostTask: MigrationTask) => {
			const aFlattenTasks = _flattenTask(oPostTask);
			aTasks.push(...aFlattenTasks);
		});
	}

	return aTasks;
}

/**
 * Flatten all main tasks and their post tasks (recursively) into an array
 *
 * @param {MigrationTask[]} aTasks the main tasks
 * @returns {Promise<MigrationTask[]>} Promise which resolves with a flat array with main tasks and their post tasks
 */
export async function flattenTaskArray(
	aTasks: MigrationTask[]
): Promise<MigrationTask[]> {
	// fill the cache of all supported tasks if it's empty
	if (taskCache.length === 0) {
		const aSupportedTasks: MigrationTask[] = await getSupportedTasks();
		taskCache.push(...aSupportedTasks);
	}

	// flatten each of the tasks and push the flatten result to an array which
	// is finally returned
	return aTasks
		.map(_flattenTask)
		.reduce(
			(
				aFlattenTasks: MigrationTask[],
				aCurrentTasks: MigrationTask[]
			): MigrationTask[] => {
				aFlattenTasks.push(...aCurrentTasks);
				return aFlattenTasks;
			},
			[]
		);
}
