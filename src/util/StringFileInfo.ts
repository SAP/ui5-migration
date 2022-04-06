import {Node} from "estree";
import * as path from "path";
import * as recast from "recast";

import * as Mod from "../Migration";
import {Reporter} from "../Migration";
import {ReportLevel} from "../Migration";

import {AnalyzeCharacter, CodeStyleAnalyzer} from "./CodeStyleAnalyzer";
import * as DiffOptimizer from "./whitespace/DiffOptimizer";

const mStrategiesCache = new Map();

export class StringFileInfo implements Mod.FileInfo {
	private input: string;
	private oAST: Node;
	private bWasModified: boolean;

	constructor(input: string) {
		this.input = input;
	}

	getAST(): Node {
		if (!this.oAST) {
			throw new Error("Requested AST before loaded");
		}
		return this.oAST;
	}

	getFileName(): string {
		return "";
	}

	getSourceCode(): string {
		return this.input;
	}

	getPath(): string {
		return "";
	}

	getNamespace(): string {
		return "";
	}

	async loadContent(): Promise<Node> {
		this.oAST = recast.parse(this.input).program;
		return this.oAST;
	}

	markModified(bWasModified: boolean) {
		this.bWasModified = bWasModified;
	}

	async saveContent(
		sOutputPath: string,
		oOutputFormat: {
			lineTerminator?: string;
			useTabs?: boolean;
			tabWidth?: number;
		} = {},
		oReporter?: Reporter
	): Promise<string> {
		if (!this.oAST) {
			throw new Error("File Info is not loaded");
		}

		oOutputFormat = Object.assign(
			{useTabs: true, lineTerminator: "\n"},
			oOutputFormat
		);

		const bAutoLineTerminator = oOutputFormat["auto.lineTerminator"];
		const bAutoUseTabs = oOutputFormat["auto.useTabs"];
		if (bAutoLineTerminator || bAutoUseTabs) {
			const startTime = process.hrtime();
			const analyzer = new CodeStyleAnalyzer(this.input);
			if (bAutoLineTerminator) {
				const mostCommonNewline = analyzer.getMostCommon(
					AnalyzeCharacter.NEWLINE
				);
				if (mostCommonNewline) {
					oOutputFormat.lineTerminator =
						mostCommonNewline === "N" ? "\n" : "\r\n";
				}
			}
			if (bAutoUseTabs) {
				const mostCommonIndent = analyzer.getMostCommon(
					AnalyzeCharacter.INDENT
				);
				if (mostCommonIndent) {
					const isTab = mostCommonIndent === true;
					oOutputFormat.useTabs = isTab;
					oOutputFormat.tabWidth = isTab ? 4 : mostCommonIndent;
				}
			}
			const endTime = process.hrtime(startTime);
			if (oReporter) {
				oReporter.report(
					ReportLevel.TRACE,
					`Finished recast auto options in ${endTime[0]}s ${endTime[1]}ms`
				);
				oReporter.report(
					ReportLevel.TRACE,
					`Finished recast auto options with: ${JSON.stringify(
						oOutputFormat,
						null,
						3
					)}`
				);
			}
		}

		const prevSourceCode = this.input;
		this.input = recast.print(this.oAST, oOutputFormat).code;

		const sStrategy = oOutputFormat["auto.diffOptimization"];
		if (sStrategy) {
			if (oReporter) {
				oReporter.report(
					ReportLevel.TRACE,
					`Performing diff optimization: ${sStrategy}`
				);
			}
			try {
				const modulePath = path.join(
					__dirname,
					"whitespace",
					sStrategy
				);
				const oCachedStrategy = mStrategiesCache.get(modulePath);
				const oStrategy = oCachedStrategy || require(modulePath);
				if (!oCachedStrategy) {
					mStrategiesCache.set(modulePath, oStrategy);
				}

				if (!oStrategy || !oStrategy[sStrategy]) {
					if (oReporter) {
						oReporter.report(
							ReportLevel.ERROR,
							`Failed to load strategy ${sStrategy}`
						);
					}
				} else {
					const startTime = process.hrtime();
					this.input = await DiffOptimizer.optimizeString(
						prevSourceCode,
						this.input,
						oReporter,
						new oStrategy[sStrategy](oReporter)
					);
					const endTime = process.hrtime(startTime);
					if (oReporter) {
						oReporter.report(
							ReportLevel.TRACE,
							`Finished diff auto in ${endTime[0]}s ${endTime[1]}ms`
						);
					}
				}
			} catch (e) {
				if (oReporter) {
					oReporter.report(
						ReportLevel.ERROR,
						`Failed to optimize whitespaces ${e}`
					);
				}
			}
		}

		return this.input;
	}

	wasModified(): boolean {
		return this.bWasModified;
	}

	unloadContent(): void {
		delete this.oAST;
		this.oAST = undefined;
	}
}
