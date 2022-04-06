import * as ESTree from "estree";
import * as path from "path";
import * as recast from "recast";

import * as Mod from "../Migration";
import {Reporter, ReportLevel} from "../Migration";

import {AnalyzeCharacter, CodeStyleAnalyzer} from "./CodeStyleAnalyzer";
import * as FileUtils from "./FileUtils";
import * as DiffOptimizer from "./whitespace/DiffOptimizer";

// TODO rename to FileAccess

const mStrategiesCache = new Map();

/**
 * Represents a module for a file.
 * It doesn't load the contents without being asked for explicitly.
 *
 * @class FileInfo
 * @implements {Mod.FileInfo}
 */
export class FileInfo implements Mod.FileInfo {
	sModuleName: string;
	sRelPath: string;
	sFullPath: string;
	sSourceCode: string;
	oAST: ESTree.Node;
	bWasModified: boolean;
	private sNamespace: string;
	private oReporter: Reporter;

	// TODO make FileInfo free from instance variables such as oAST

	/**
	 *
	 * @param {string} sRootPath
	 * @param {string} sRelPath
	 * @param {string} sModuleName
	 * @param {string} sNamespace
	 */
	constructor(
		sRootPath: string,
		sRelPath: string,
		sModuleName: string,
		sNamespace: string
	) {
		this.sFullPath = path.isAbsolute(sRelPath)
			? sRelPath
			: path.join(sRootPath, sRelPath);
		this.sRelPath = sRelPath;
		this.sModuleName = sModuleName;
		this.sSourceCode = "";
		this.oAST = undefined;
		this.bWasModified = false;
		this.sNamespace = sNamespace;
	}

	async loadContent(): Promise<ESTree.Node> {
		if (!this.oAST) {
			this.sSourceCode = await FileUtils.fsReadFile(
				this.sFullPath,
				"utf8"
			);
			this.oAST = recast.parse(this.sSourceCode).program;
		}
		return this.oAST;
	}

	wasModified(): boolean {
		return this.bWasModified;
	}

	markModified(bWasModified: boolean) {
		this.bWasModified = bWasModified;
	}

	unloadContent(): void {
		delete this.oAST;
		this.oAST = undefined;
		this.sSourceCode = "";
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
			const analyzer = new CodeStyleAnalyzer(this.sSourceCode);
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

		const prevSourceCode = this.sSourceCode;
		this.sSourceCode = recast.print(this.oAST, oOutputFormat).code;

		// restore whitespace characters at the end of the file
		if (/\s+$/.test(prevSourceCode)) {
			const lastWhiteSpacesRegExp = /(\s*)$/;
			const prevSpaces = lastWhiteSpacesRegExp.exec(prevSourceCode)[0];
			const currentSpaces = lastWhiteSpacesRegExp.exec(
				this.sSourceCode
			)[0];

			if (prevSpaces !== currentSpaces) {
				this.sSourceCode = this.sSourceCode.replace(
					lastWhiteSpacesRegExp,
					prevSpaces
				);
			}
		}

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
					this.sSourceCode = await DiffOptimizer.optimizeString(
						prevSourceCode,
						this.sSourceCode,
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

		const sOutPath = path.join(sOutputPath, this.sRelPath);
		await FileUtils.mkdirs(path.dirname(sOutPath));
		await FileUtils.fsWriteFile(sOutPath, this.sSourceCode);
		return this.sSourceCode;
	}

	/**
	 * Retrieves fully qualified namespace e.g. x.y.d.e for file a/b/c/d/e.js
	 * (namespace x.y for folder a/b/c)
	 * @returns {string} e.g. x.y.d.e
	 */
	getNamespace(): string {
		return this.sNamespace;
	}

	getPath(): string {
		return this.sRelPath;
	}

	getFileName(): string {
		return this.sModuleName;
	}

	getSourceCode(): string {
		if (!this.sSourceCode) {
			throw new Error("Requested source code before loaded");
		}
		return this.sSourceCode;
	}

	getAST(): ESTree.Node {
		if (!this.oAST) {
			throw new Error("Requested AST before loaded");
		}
		return this.oAST;
	}
}
