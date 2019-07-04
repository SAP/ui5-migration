/* tslint:disable:no-console */

import * as ESTree from "estree";

import {CompareReportLevel, Finding, ReportContext, Reporter, ReportLevel} from "./Reporter";

export class ConsoleReporter implements Reporter {
	sLevel: ReportLevel;
	oMap: Map<string, string[]|number> = new Map();
	oReportContext: ReportContext;
	findings: Finding[];

	constructor(level: ReportLevel) {
		this.sLevel = level;
		this.oReportContext = {};
		this.findings = [];
	}

	/**
	 * get reported entries
	 */
	getFindings(): Finding[] {
		return this.findings;
	}

	storeFinding(msg: string, loc?: ESTree.SourceLocation) {
		this.findings.push({
			filename : this.oReportContext.fileName,
			loc,
			msg,
			taskName : this.oReportContext.taskName
		});
	}

	report(level: ReportLevel, msg: string, loc?: ESTree.SourceLocation) {
		if (CompareReportLevel(level, this.sLevel) < 0) {
			return;
		}

		// Format location (in gcc style)
		const aParams = [];
		let sMessage = "";
		// Format rest and output
		sMessage += "\x1b[36m%s\x1b[0m ";
		aParams.push(level);
		if (this.oReportContext.taskName) {
			aParams.push(this.oReportContext.taskName);
			sMessage += "\x1b[35m%s\x1b[0m ";
		}
		if (this.oReportContext.logPrefix) {
			aParams.push(this.oReportContext.logPrefix);
			sMessage += "\x1b[35m%s\x1b[0m ";
		}
		if (this.oReportContext.fileName) {
			let sOutFileName = this.oReportContext.fileName;
			if (loc) {
				let oLocation: ESTree.SourceLocation;
				oLocation = loc as ESTree.SourceLocation;

				if (oLocation.start) {
					sOutFileName += ":" + oLocation.start.line + ":" +
						oLocation.start.column;
				} else {
					sOutFileName += ":1:1";
				}
			} else {
				sOutFileName += ":1:1";
			}
			sOutFileName += "";
			sMessage += "%s ";
			aParams.push(sOutFileName);
		}

		sMessage += "%s";
		aParams.push(msg);
		ConsoleReporter.log(level, sMessage, aParams);
	}

	private static log(
		level: string, sMessage: string, aParams: string[] = []) {
		switch (level) {
			case ReportLevel.WARNING:
				console.warn(sMessage, ...aParams);
				break;
			case ReportLevel.ERROR:
				console.error(sMessage, ...aParams);
				break;
			default:
				console.log(sMessage, ...aParams);
				break;
		}
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
		if (this.oMap.size === 0) {
			return;
		}
		const sReporter =
			this.oReportContext.logPrefix || this.oReportContext.taskName;
		this.setContext({ logPrefix : "", fileName : "" });
		ConsoleReporter.log(level, "");
		ConsoleReporter.log(
			level, "Report for \x1b[31m%s\x1b[0m:", [ sReporter ]);
		const that = this;
		this.oMap.forEach(function(value, key, map) {
			if (typeof value === "number") {
				that.report(level, key + ": " + value);
			} else {
				that.report(
					level, "value: " + key + ": entries: " + value.length);
			}
		});
		this.oMap.clear();
	}

	setContext(oReportContext: ReportContext): void {
		this.oReportContext = oReportContext;
	}

	getContext(): ReportContext {
		return this.oReportContext;
	}

	async finalize(): Promise<{}> {
		// empty, because of reasons
		return Promise.resolve({});
	}
}
