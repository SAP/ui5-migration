import * as ESTree from "estree";

import {BaseReporter} from "./BaseReporter";
import {CompareReportLevel, ReportContext, ReportLevel} from "./Reporter";

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
		start: {line: number; column: number};
		end: {line: number; column: number};
	};
}

export class JSONReporter extends BaseReporter {
	sLevel: ReportLevel;
	aItems: JSONReporterItem[];
	sFileName: string;
	oMap: Map<string, string[] | number> = new Map();

	constructor(level: ReportLevel) {
		super();
		this.sLevel = level;
		this.sFileName = "";
		this.aItems = [];
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
				start: {line: 1, column: 0},
				end: {line: 1, column: 0},
			};
		}

		this.aItems.push({
			fileName: this.sFileName,
			level,
			codeReplacement: !!locNode,
			context: this.getContext(),
			message: msg,
			location: {
				start: {
					line: oLocation.start.line,
					column: oLocation.start.column,
				},
				end: {
					line: oLocation.end.line,
					column: oLocation.end.column,
				},
			},
		});
	}

	collect(sKey: string, oValue: string | number) {
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
		this.oMap.forEach((value, key) => {
			if (typeof value === "number") {
				this.report(level, "value: " + key + ": " + value);
			} else {
				this.report(
					level,
					"value: " + key + ": entries: " + value.length
				);
			}
		});
		this.oMap.clear();
	}

	async finalize(): Promise<JSONReporterResult> {
		return Promise.resolve({
			reports: this.aItems,
			context: this.getContext(),
		});
	}
}
