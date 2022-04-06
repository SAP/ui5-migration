import * as yargs from "yargs";
import {hideBin} from "yargs/helpers";

import * as TaskRunner from "./index";
import {ReportLevel} from "./reporter/Reporter";
import {parseNamespaces} from "./util/CLIUtils";

const path = require("path");

export async function start(): Promise<void> {
	// Basic options
	const argv = await yargs
		.group(["help"], "Basics:")
		.usage("Usage: $0 <command> [options]")
		.command("migrate", "Migrates all js files in the current folder")
		.example(
			'$0 migrate "src"',
			'Migrates all js files in the "src" folder'
		)
		.command("analyze", "Analyzes all js files in the current folder")
		.example(
			'$0 analyze "src"',
			'Analyzes all js files in the "src" folder'
		)
		.help()
		.version()
		.option("exclude-path", {
			alias: ["e"],
			array: true,
			describe: "Glob patterns to paths which should be excluded.",
			default: ["node_modules/**/*", "node_modules/**/.*", ".*"],
		})
		.option("target-version", {
			alias: ["x"],
			string: true,
			describe: "Sets UI5 target version",
			default: "latest",
		})
		.option("output", {
			alias: ["o"],
			string: true,
			describe: "Sets output directory for migrated files",
			default: process.cwd(),
			normalize: true,
		})
		.option("output-format", {
			alias: ["f"],
			string: true,
			describe: "Sets output formatting config",
			default: path.join(
				__dirname,
				"../../defaultConfig/printer.config.json"
			),
			normalize: true,
		})
		.option("task", {
			alias: ["t"],
			array: true,
			describe: "Specifies one or more migration tasks to execute.",
			choices: [
				"all",
				"replace-globals",
				"fix-jquery-plugin-imports",
				"apply-amd-syntax",
				"add-renderer-dependencies",
				"fix-type-dependencies",
			],
			default: ["all"],
		})
		/**
		 * namespaces = ["a.b.c:src", "x.y.z:./"]
		 */
		.option("namespaces", {
			alias: ["n"],
			array: true,
			describe: "Specifies one or more namespaces.",
			default: [],
		})
		.option("loglevel", {
			alias: ["l"],
			string: true,
			describe: "Set the logging level.",
			choices: [
				ReportLevel.TRACE,
				ReportLevel.DEBUG,
				ReportLevel.INFO,
				ReportLevel.WARNING,
				ReportLevel.ERROR,
			],
			default: ReportLevel.INFO,
		})
		.option("ignore-file", {
			alias: ["i"],
			string: true,
			describe: "Use ignore file.",
			default: ".gitignore",
		})
		.check(argv => {
			const commandArgument = argv._[0] as string;
			const bValid =
				argv._.length >= 1 &&
				["migrate", "analyze"].includes(commandArgument);

			if (!bValid) {
				throw new Error(
					"wrong command specified: '" +
						(argv._[0] ? argv._[0] : "") +
						'\'. Use one of [ "migrate", "analyze" ].'
				);
			}
			return true;
		}, true)
		.parse(hideBin(process.argv));

	// const bMigrate = argv._[0] === "migrate";
	const bAnalyze = argv._[0] === "analyze";

	const aPlainArguments = argv._.slice(1) as string[];

	const namespaces: string[] = argv["namespaces"];
	const tasks: string[] = argv["task"];

	return TaskRunner.migrate({
		root: process.cwd(),
		output: argv["output"],
		outputFormat: argv["output-format"],
		includePaths: aPlainArguments,
		excludePaths: argv["exclude-path"],
		dryRun: bAnalyze,
		targetVersion: argv["target-version"],
		reportLevel: argv["loglevel"],
		ignoreFile: argv["ignore-file"],
		namespaces: parseNamespaces(namespaces),
		tasks,
	}).then(() => {
		return undefined;
	});
}
