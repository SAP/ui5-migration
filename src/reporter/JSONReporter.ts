import * as ESTree from "estree";

import {CompareReportLevel, Finding, fromLoc, ReportContext, Reporter, ReportLevel} from "./Reporter";

export interface JSONReporterResult {
	reports: JSONReporterItem[];
	context: ReportContext;
}
export interface JSONReporterItem {
	fileName: string;
	level: string;
	context: ReportContext;
	message: string;
	codeReplacement: boolean;
	location?: {
		start: { line: number, column: number },
		end: { line: number, column: number }
	};
}

export class JSONReporter implements Reporter {
	sLevel: ReportLevel;
	aItems: JSONReporterItem[];
	sFileName: string;
	oContext: ReportContext;
	oMap: Map<string, string[]|number> = new Map();
	findings: Finding[];

	constructor(level: ReportLevel) {
		this.sLevel = level;
		this.sFileName = "";
		this.aItems = [];
		this.oContext = {};
		this.findings = [];
	}

	storeFinding(msg: string, loc?: ESTree.SourceLocation) {
		this.findings.push({
			filename : this.oContext.fileName,
			location : fromLoc(loc),
			msg,
			taskName : this.oContext.taskName
		});
	}

	/**
	 * get reported entries
	 */
	getFindings(): Finding[] {
		return this.findings;
	}

	report(level: ReportLevel, msg: string, locNode?: ESTree.SourceLocation) {
		if (CompareReportLevel(level, this.sLevel) < 0) {
			return;
		}

		let oLocation: ESTree.SourceLocation;
		if (locNode) {
			oLocation = locNode as ESTree.SourceLocation;
		} else {
			oLocation = {
				start : { line : 1, column : 0 },
				end : { line : 1, column : 0 }
			};
		}

		this.aItems.push({
			fileName : this.sFileName,
			level,
			codeReplacement : !!locNode,
			context : this.oContext,
			message : msg,
			location : {
				start : {
					line : oLocation.start.line,
					column : oLocation.start.column
				},
				end : {
					line : oLocation.end.line,
					column : oLocation.end.column
				}
			}
		});
	}

	collect(sKey: string, oValue: string|number) {
		if (typeof oValue === "number") {
			if (!this.oMap.has(sKey)) {
				this.oMap.set(sKey, oValue);
			} else {
				const iPrevious = this.oMap.get(sKey);
				if (typeof iPrevious === "number") {
					this.oMap.set(sKey, iPrevious + oValue);
				}
			}
		} else {
			if (!this.oMap.has(sKey)) {
				this.oMap.set(sKey, []);
			}
			const aList = this.oMap.get(sKey);
			if (Array.isArray(aList)) {
				aList.push(oValue);
			}
		}
	}

	reportCollected(level: ReportLevel) {
		const that = this;
		this.oMap.forEach(function(value, key, map) {
			if (typeof value === "number") {
				that.report(level, "value: " + key + ": " + value);
			} else {
				that.report(
					level, "value: " + key + ": entries: " + value.length);
			}
		});
		this.oMap.clear();
	}

	setContext(oContext: ReportContext): void {
		this.oContext = oContext;
	}

	getContext(): ReportContext {
		return this.oContext;
	}

	async finalize(): Promise<JSONReporterResult> {
		return Promise.resolve(
			{ reports : this.aItems, context : this.getContext() });
	}
}
