import * as ESTree from "estree";
import {Node} from "estree";

import * as Mod from "../../src/Migration";
import {
	AnalyseArguments,
	MigrateArguments,
	ReportLevel,
} from "../../src/Migration";
import {BaseReporter} from "../../src/reporter/BaseReporter";
import {MetaConsoleReporter} from "../../src/reporter/MetaConsoleReporter";
import {Reporter} from "../../src/reporter/Reporter";
import {MigrationTask} from "../../src/taskRunner";
import {FileInfo} from "../../src/util/FileInfo";

const recast = require("recast");
const fs = require("graceful-fs");

export class CustomMetaReporter extends MetaConsoleReporter {
	private reports: string[];
	private level: string;
	private instance: Reporter;

	constructor(reports = [], level: ReportLevel = ReportLevel.DEBUG) {
		super(level);
		this.reports = [];
		this.level = level;
	}

	registerReporter(sName: string): Reporter {
		if (!this.instance) {
			this.instance = new CustomReporter(this.reports, this.level);
		}
		return this.instance;
	}

	getReporter(sName: string): Reporter {
		return this.instance;
	}

	getReports() {
		return this.reports;
	}
}

export class CustomReporter extends BaseReporter {
	private reports: string[];
	private level: string;

	constructor(reports = [], level = "debug") {
		super();
		this.reports = reports;
		this.level = level;
	}
	report(level: string, msg: string, loc: ESTree.SourceLocation) {
		if (level === "trace" && this.level !== "trace") {
			return;
		}
		let locStr = "";
		if (loc && loc.start) {
			locStr = loc.start.line + ": ";
		}
		const fullMsg = level + ": " + locStr + msg;
		this.reports.push(fullMsg);
	}
	collect() {}

	reportCollected(level: ReportLevel): void {}

	finalize(): Promise<{}> {
		return Promise.resolve({});
	}

	getReports() {
		return this.reports;
	}
}

export class CustomFileInfo implements Mod.FileInfo {
	private sourceCode: string;
	private name: string;
	private ast: ESTree.Node;
	private namespace: string;
	private path: string;
	constructor(path: string, namespace?: string) {
		this.path = path;
		this.name = path.replace(/\.js$/, "");
		this.sourceCode = fs.readFileSync(path, "utf8");
		this.ast = recast.parse(this.sourceCode).program;
		this.namespace = namespace;
	}

	getFileName(): string {
		return this.name;
	}

	getSourceCode(): string {
		return this.sourceCode;
	}

	getNamespace(): string {
		return this.namespace;
	}

	getAST(): ESTree.Node {
		return this.ast;
	}

	getPath(): string {
		return this.path;
	}

	loadContent(): Promise<Node> {
		return undefined;
	}

	markModified(bWasModified: boolean) {}

	saveContent(sOutputPath: string): Promise<string> {
		return undefined;
	}

	unloadContent(): void {}

	wasModified(): boolean {
		return false;
	}
}

export class CustomMigrationTask implements MigrationTask {
	private aFnAnalyze: Function[] = [];
	private aFnMigrate: Function[] = [];
	addOnAnalyzeListener(fnAnalyze: (args: AnalyseArguments) => void) {
		this.aFnAnalyze.push(fnAnalyze);
	}

	addOnMigrateListener(fnMigrate: (args: MigrateArguments) => void) {
		this.aFnMigrate.push(fnMigrate);
	}

	analyse(args: AnalyseArguments): Promise<{}> {
		this.aFnAnalyze.forEach(fnAnalyze => {
			if (fnAnalyze) {
				fnAnalyze(args);
			}
		});
		return Promise.resolve({});
	}
	config = {};
	defaultConfig = function () {
		return Promise.resolve({});
	};
	description = "";
	keywords: string[] = [];
	migrate(args: MigrateArguments): Promise<boolean> {
		this.aFnMigrate.forEach(fnMigrate => {
			fnMigrate(args);
		});
		return Promise.resolve(true);
	}
	name = "CustomMigrationTask";
	priority = 0;
}

export class CustomLocalFileInfo extends FileInfo {
	private aFnSave: Function[] = [];
	private wasUnloaded: boolean;
	constructor(dir: string, path: string) {
		super(dir, path, path.replace(/\.js$/, ""), "");
		this.wasUnloaded = false;
	}

	addOnSaveListener(
		fnSave: (bWasModified: boolean, sSourceCode: string) => void
	) {
		if (fnSave) {
			this.aFnSave.push(fnSave);
		}
	}

	unloadContent(): void {
		this.sSourceCode = "";
		this.wasUnloaded = true;
	}

	async saveContent(sOutputPath: string): Promise<string> {
		this.sSourceCode = recast.print(this.oAST, {
			useTabs: true,
			lineTerminator: "\n",
		}).code;

		// mkdir operation should be async
		await new Promise((resolve, reject) => {
			if (this.wasUnloaded) {
				reject("Unloaded before save was called!");
				return;
			}
			resolve(null);
		});
		// save operation should be async
		await new Promise((resolve, reject) => {
			if (this.wasUnloaded) {
				reject("Unloaded before save was called!");
				return;
			}
			this.aFnSave.forEach(fnSave => {
				fnSave(this.bWasModified, this.sSourceCode);
			});
			resolve(null);
		});
		return this.sSourceCode;
	}
}

export class CustomFileFinder implements Mod.FileFinder {
	async findByPath(sPath: string): Promise<Mod.FileInfo | null> {
		try {
			const oCustomFileInfo = new CustomFileInfo(sPath);
			return Promise.resolve(oCustomFileInfo);
		} catch (e) {
			return Promise.resolve(null);
		}
	}
}
