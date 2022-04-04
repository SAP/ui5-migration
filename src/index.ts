import * as ESTree from "estree";

import {JSONReporter, Reporter, ReportLevel} from "./Migration";
import {JSONReporterResult} from "./reporter/JSONReporter";
import {MetaConsoleReporter} from "./reporter/MetaConsoleReporter";
import * as TaskRunner from "./taskRunner";
import {MigrationTask} from "./taskRunner";
import {ProcessModuleResult} from "./taskRunner";
import {FsFilter} from "./util/file/FsFilter";
import * as FsFilterFactory from "./util/file/FsFilterFactory";
import {FileFinder} from "./util/FileFinder";
import * as FileUtils from "./util/FileUtils";
import {NoopFileFinder} from "./util/NoopFileFinder";
import {StringFileInfo} from "./util/StringFileInfo";

export interface NamespaceConfig {
	namespace: string;
	filePath: string;
}

export interface IndexArgs {
	root: string;
	output: string;
	outputFormat: string;
	targetVersion: string;
	includePaths: string[];
	excludePaths: string[];
	tasks: string[];
	namespaces: NamespaceConfig[];
	reportLevel?: string;
	ignoreFile?: string;
	reporter?: MetaConsoleReporter;
	dryRun: boolean;
}

export interface MigrationLogResult {
	taskName: string;
	replacements: [
		{
			modification: string;
			location?: {
				start: {line: number; column: number};
				end: {line: number; column: number};
			};
		}
	];
}

export interface MigrationResult {
	output: string;
	log?: MigrationLogResult[];
}

class MetaJSONReporter extends MetaConsoleReporter {
	report(level: ReportLevel, msg: string, loc?: ESTree.SourceLocation) {
		return;
	}

	createReporter(level: ReportLevel): Reporter {
		return new JSONReporter(level);
	}

	reportCollected(level: ReportLevel) {
		this.getReporters().forEach(oReporter =>
			oReporter.reportCollected(level)
		);
	}
}

/**
 *
 * @param aSupportedTasks
 * @param sTaskName "replaceGlobals"
 */
function getKeywordFromTaskName(
	aSupportedTasks: MigrationTask[],
	sTaskName: string
) {
	const tasks = aSupportedTasks.filter(oTask => {
		return oTask.name === sTaskName;
	});
	if (tasks.length !== 1) {
		return undefined;
	}
	const getKeywordFromTask = tasks[0].keywords.filter(sKeyword => {
		return sKeyword !== "all";
	});
	if (getKeywordFromTask.length !== 1) {
		return undefined;
	}
	return getKeywordFromTask[0];
}

export async function migrateString(
	tasks: string[] = ["all"],
	input: string,
	reportLevel: ReportLevel = ReportLevel.INFO
): Promise<MigrationResult> {
	if (typeof input !== "string") {
		return Promise.reject(new Error("input must be a string"));
	}

	// TODO revise concept for MetaConsoleReporter
	const oTaskRunnerReporter = new MetaJSONReporter(reportLevel);

	const stringFileInfo = new StringFileInfo(input);

	let aFilteredTasksToUse: MigrationTask[];
	let aProcessModuleResults: ProcessModuleResult[];
	return getFilteredTasks(tasks)
		.then((aTasksToUse: MigrationTask[]) => {
			aFilteredTasksToUse = aTasksToUse;
			return TaskRunner.processModules(
				aTasksToUse,
				[stringFileInfo],
				oTaskRunnerReporter,
				new NoopFileFinder(),
				null,
				null,
				false
			);
		})
		.then((aResults: ProcessModuleResult[]) => {
			aProcessModuleResults = aResults;
			oTaskRunnerReporter.setContext(
				Object.assign(oTaskRunnerReporter.getContext(), {
					fileName: "",
				})
			);
			oTaskRunnerReporter.report(ReportLevel.INFO, "Finished");
			oTaskRunnerReporter.reportCollected(ReportLevel.INFO);
			return oTaskRunnerReporter.finalize();
		})
		.then(oReporterResults => {
			const sOuput =
				aProcessModuleResults.length > 0
					? aProcessModuleResults[0].modifiedCode
					: "";

			const fnCodeReplacementFilter = oReport => {
				return oReport.codeReplacement;
			};

			let logResult;
			if (Array.isArray(oReporterResults)) {
				logResult = oReporterResults
					.filter(oReport => {
						return (
							oReport.reports &&
							oReport.reports.length > 0 &&
							oReport.reports.filter(fnCodeReplacementFilter)
								.length > 0
						);
					})
					.map((oReporterResult: JSONReporterResult) => {
						const keywordTaskName = getKeywordFromTaskName(
							aFilteredTasksToUse,
							oReporterResult.context.taskName
						);
						return {
							taskName: keywordTaskName
								? keywordTaskName
								: oReporterResult.context.taskName,
							replacements: oReporterResult.reports
								.filter(fnCodeReplacementFilter)
								.map(oReport => {
									return {
										location: oReport.location,
										modification: oReport.message,
									};
								}),
						};
					});
			} else {
				logResult = oReporterResults;
			}
			return {output: sOuput, log: logResult};
		});
}

/**
 * TODO use an enum here
 * @param {string[]} aTasks keywords
 * @return {Promise<MigrationTask[]>}
 */
async function getFilteredTasks(aTasks): Promise<MigrationTask[]> {
	return TaskRunner.getSupportedTasks().then(aSupportedTasks => {
		return aSupportedTasks.filter(oModules => {
			return oModules["keywords"].some(keyword =>
				aTasks.includes(keyword.toString())
			);
		});
	});
}

/**
 * Migrates
 * @param oArgs
 */
export async function migrate(oArgs: IndexArgs): Promise<{}> {
	// TODO: Need to be replaced by meaningful types
	const sOutputDir = oArgs.output,
		aIncludedPaths = oArgs.includePaths,
		aExcludedPaths = oArgs.excludePaths,
		sVersion = oArgs.targetVersion,
		aTasks = oArgs.tasks, // TODO: replace with enum Tasks
		oReportLevel = (oArgs.reportLevel as ReportLevel) || ReportLevel.INFO,
		oTaskRunnerReporter =
			oArgs.reporter || new MetaConsoleReporter(oReportLevel),
		bAnalyze = oArgs.dryRun,
		oOutputFormat = JSON.parse(
			await FileUtils.fsReadFile(oArgs.outputFormat, "utf8")
		);
	oTaskRunnerReporter.setContext({logPrefix: "cli"});

	const startTime = process.hrtime();

	// Retrieves all supported tasks
	const aTasksToUse = await getFilteredTasks(aTasks);
	// Only uses migration scripts which have been chosen by user

	const builder = FileFinder.getBuilder();

	// exclude all non-js files
	const onlyJsFilesFilter: FsFilter = {
		match(sFile: string): boolean {
			return sFile.endsWith(".js");
		},

		getDir(): string {
			return "";
		},
	};
	builder.postFilters([onlyJsFilesFilter]);

	const aFilterPromises: Array<Promise<void>> = [];
	if (Array.isArray(aExcludedPaths)) {
		aExcludedPaths.forEach(sExcludePath => {
			oTaskRunnerReporter.report(
				ReportLevel.DEBUG,
				"Ignoring folder '" + sExcludePath + "'"
			);
			aFilterPromises.push(
				FsFilterFactory.createFilter(sExcludePath).then(oFilter => {
					builder.excludeFilesFromFilter([oFilter]);
				})
			);
		});
	}

	if (oArgs.ignoreFile && (await FileUtils.isFile(oArgs.ignoreFile))) {
		oTaskRunnerReporter.report(
			ReportLevel.INFO,
			`Using ignore file: ${oArgs.ignoreFile}`
		);
		aFilterPromises.push(
			FsFilterFactory.createIgnoreFileFilter(oArgs.ignoreFile).then(
				oFilter => {
					builder.excludeFilesFromFilter([oFilter]);
				}
			)
		);
	} else {
		oTaskRunnerReporter.report(
			ReportLevel.INFO,
			`Skipping ignore file: ${oArgs.ignoreFile}`
		);
	}

	if (Array.isArray(aIncludedPaths)) {
		aIncludedPaths.forEach(sIncludePath => {
			oTaskRunnerReporter.report(
				ReportLevel.INFO,
				"Searching in folder '" + sIncludePath + "'"
			);
			aFilterPromises.push(
				FsFilterFactory.createFilter(sIncludePath).then(oFilter => {
					builder.addFilesFromFilter([oFilter]);
				})
			);
		});
	}
	if (!aIncludedPaths || aIncludedPaths.length === 0) {
		oTaskRunnerReporter.report(
			ReportLevel.INFO,
			"Searching current folder"
		);
		aFilterPromises.push(
			FsFilterFactory.createFilter(process.cwd()).then(oFilter => {
				builder.addFilesFromFilter([oFilter]);
			})
		);
	}

	oTaskRunnerReporter.report(
		ReportLevel.INFO,
		"Searching for files to " + (bAnalyze ? "analyze" : "migrate") + "..."
	);

	await Promise.all(aFilterPromises);
	const fileFinder = builder.build();
	const aFiles = await fileFinder.getFiles();
	if (aFiles.length === 0) {
		oTaskRunnerReporter.report(ReportLevel.INFO, "No files found!");
		// exit the program with an error
		throw new Error("No files found!");
	}

	// execute migration
	const aFileInfo = await fileFinder.getFileInfoArray();
	oTaskRunnerReporter.report(
		ReportLevel.INFO,
		(bAnalyze ? "Analyzing" : "Migrating") +
			" " +
			aFileInfo.length +
			" " +
			(aFileInfo.length === 1 ? "file" : "files") +
			":"
	);

	aFileInfo.forEach(oModule =>
		oTaskRunnerReporter.report(ReportLevel.INFO, oModule.sRelPath)
	);

	// Process modules

	// split into junks
	const fileLimit = 100;

	if (aFileInfo.length < fileLimit) {
		await TaskRunner.processModules(
			aTasksToUse,
			aFileInfo,
			oTaskRunnerReporter,
			fileFinder,
			sOutputDir,
			oOutputFormat,
			bAnalyze,
			sVersion,
			oArgs.namespaces
		);
	} else {
		const nrOfChunks = Math.ceil(aFileInfo.length / fileLimit);

		let aArray = [];
		let chain = Promise.resolve(aArray);
		for (let i = 0; i < nrOfChunks; i++) {
			chain = chain.then(() => {
				oTaskRunnerReporter.report(
					ReportLevel.INFO,
					`Processing ${i * fileLimit} chunk`
				);
				return TaskRunner.processModules(
					aTasksToUse,
					aFileInfo.slice(i * fileLimit, i * fileLimit + fileLimit),
					oTaskRunnerReporter,
					fileFinder,
					sOutputDir,
					oOutputFormat,
					bAnalyze,
					sVersion,
					oArgs.namespaces
				).then(aResult => {
					oTaskRunnerReporter.report(
						ReportLevel.INFO,
						`Processed ${i * fileLimit} chunk`
					);
					aArray = aArray.concat(aResult);
					return aArray;
				});
			});
		}
		await chain;
	}

	oTaskRunnerReporter.setContext(
		Object.assign(oTaskRunnerReporter.getContext(), {fileName: ""})
	);
	const endTime = process.hrtime(startTime);
	oTaskRunnerReporter.report(
		ReportLevel.INFO,
		`Finished in about ${endTime[0]}s`
	);
	oTaskRunnerReporter.reportCollected(ReportLevel.INFO);
	const result = oTaskRunnerReporter.finalize();

	// check if there are potential replacements with "analyze" exit with an
	// error similar to eslint, then it can be used within a CI
	if (bAnalyze && oTaskRunnerReporter.getFindings().length > 0) {
		oTaskRunnerReporter.report(
			ReportLevel.TRACE,
			`Findings: ${JSON.stringify(oTaskRunnerReporter.getFindings())}`
		);
		throw new Error("Found entries to be migrated!");
	}
	return result;
}
