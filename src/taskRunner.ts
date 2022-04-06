// TODO: Needs to be refactored into modules which makes sense e.g.
// TaskRunner.getSupportedTasks()
import * as path from "path";

import {NamespaceConfig} from "./index";
import * as Mod from "./Migration";
import {FileFinder} from "./Migration";
import {MetaConsoleReporter} from "./reporter/MetaConsoleReporter";
import {ASTVisitor} from "./util/ASTVisitor";
import * as FileUtils from "./util/FileUtils";
import {flattenTaskArray} from "./util/FlattenTaskArray";

export type MigrationTask = Mod.Task & Mod.TaskExtra;

/**
 * Finds all migration modules and loads them
 *
 * @returns {Promise<MigrationTask[]>} The array of loaded migration modules.
 * The list is sorted by priority of the Migration Entity.
 */
export async function getSupportedTasks(): Promise<MigrationTask[]> {
	const sTaskPath = path.join(__dirname, "./", "tasks");
	let aFileNames = await FileUtils.fsReadDir(sTaskPath);
	const aModules: MigrationTask[] = [];

	aFileNames = aFileNames.filter(file => !file.endsWith(".d.ts"));

	for (const sFileName of aFileNames) {
		if (sFileName.endsWith(".js") || sFileName.endsWith(".ts")) {
			const module = require(path
				.join(sTaskPath, sFileName)
				.replace(/(.js|.ts)$/, "")) as MigrationTask;
			module.name = path.basename(sFileName, path.extname(sFileName));
			if (module.defaultConfig) {
				module.config = await module.defaultConfig();
			} else {
				module.config = {};
			}
			aModules.push(module);
		}
	}

	// sort modules such that amd cleanup is the first one in the list
	aModules.sort((a, b) => {
		if (a.priority === b.priority) {
			return 0;
		}
		return a.priority > b.priority ? -1 : 1;
	});

	return aModules;
}

export interface ProcessModuleResult {
	modifiedCode: string;
	fileInfo: Mod.FileInfo;
}

export async function processModules(
	aTasks: MigrationTask[],
	aFileInfo: Mod.FileInfo[],
	oReporter: MetaConsoleReporter,
	oFileFinder: FileFinder,
	sOutputPath: string,
	oOutputFormat: {},
	bDryRun: boolean,
	sVersion = "latest",
	namespaces: NamespaceConfig[] = []
): Promise<ProcessModuleResult[]> {
	// Analyse step
	const iFiles = aFileInfo.length;
	let iFilesModified = 0;

	oReporter.collectTopLevel("files", iFiles);
	oReporter.report(Mod.ReportLevel.INFO, `Files: ${iFiles}`);
	oReporter.report(
		Mod.ReportLevel.INFO,
		`Tasks: ${aTasks.map(oTask => oTask.name).join(", ")}`
	);

	aTasks = await flattenTaskArray(aTasks);

	const aModifiedFiles: Array<Promise<ProcessModuleResult>> = [];
	for (const oFileInfo of aFileInfo) {
		const oVisitor = new ASTVisitor();
		oReporter.setContext(
			Object.assign(oReporter.getContext(), {
				fileName: oFileInfo.getPath(),
			})
		);
		oReporter.report(Mod.ReportLevel.TRACE, "Start analysing");
		try {
			await oFileInfo.loadContent();
		} catch (err) {
			oReporter.report(
				Mod.ReportLevel.ERROR,
				"Could not load module: " +
					oFileInfo.getFileName() +
					", error: " +
					(err.message || err)
			);
			continue;
		}
		let oAnalyseResult;
		for (const oTask of aTasks) {
			const taskReporter = oReporter.registerReporter(oTask.name);
			if (oFileInfo.getPath()) {
				taskReporter.setContext(
					Object.assign(taskReporter.getContext(), {
						fileName: oFileInfo.getPath(),
					})
				);
			}

			const oConfig = oTask.config;

			oAnalyseResult = await oTask
				.analyse({
					reporter: taskReporter,
					fileFinder: oFileFinder,
					file: oFileInfo,
					visitor: oVisitor,
					config: oConfig,
					targetVersion: sVersion,
				})
				.catch(err => {
					taskReporter.report(
						Mod.ReportLevel.ERROR,
						`Analysis failed. Error: ${err.message}`
					);
					taskReporter.report(
						Mod.ReportLevel.DEBUG,
						`Stack: ${err.stack}`
					);
				});

			if (!bDryRun && oAnalyseResult && oTask && oTask.migrate) {
				// Migrate step
				const bWasModified = await oTask
					.migrate({
						reporter: taskReporter,
						fileFinder: oFileFinder,
						file: oFileInfo,
						visitor: oVisitor,
						config: oConfig,
						targetVersion: sVersion,
						analyseResult: oAnalyseResult,
					})
					.catch(err => {
						taskReporter.report(
							Mod.ReportLevel.ERROR,
							`${
								oTask.name
							}: Failed to migrate: ${oFileInfo.getFileName()}, error: ${
								err.message
							}`
						);
						taskReporter.report(
							Mod.ReportLevel.DEBUG,
							`Stack: ${err.stack}`
						);
						return false;
					});
				if (bWasModified && !oFileInfo.wasModified()) {
					oFileInfo.markModified(true);
				}
			}
		}

		if (oFileInfo.wasModified()) {
			iFilesModified++;
			aModifiedFiles.push(
				oFileInfo
					.saveContent(sOutputPath, oOutputFormat, oReporter)
					.then(sResult => {
						oReporter.report(
							Mod.ReportLevel.TRACE,
							`Wrote: ${oFileInfo.getPath()} with ${oFileInfo.getFileName()}`
						);
						// content needs to be unloaded after modification was
						// performed
						oFileInfo.unloadContent();
						return {fileInfo: oFileInfo, modifiedCode: sResult};
					})
			);
		} else {
			oFileInfo.unloadContent();
		}
		oVisitor.resetCache();
		if (global.gc) {
			global.gc();
		}
	}
	oReporter.setContext({logPrefix: "cli"});
	oReporter.collectTopLevel("files modified", iFilesModified);
	return Promise.all(aModifiedFiles);
}
