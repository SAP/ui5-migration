/* tslint:disable:no-console */

import * as ESTree from "estree";

import {BaseReporter} from "./BaseReporter";
import {CompareReportLevel, Finding, fromLoc, ReportLevel} from "./Reporter";

/**
 * Represents a Reporter which logs to the console
 */
export class ConsoleReporter extends BaseReporter {
	sLevel: ReportLevel;
	oMap: Map<string, string[] | number> = new Map();

	constructor(level: ReportLevel) {
		super();
		this.sLevel = level;
	}

	/**
	 * get reported entries
	 */
	getFindings(): Finding[] {
		return this.findings;
	}

	storeFinding(msg: string, loc?: ESTree.SourceLocation) {
		this.findings.push({
			fileName: this.getContext().fileName,
			location: fromLoc(loc),
			message: msg,
			taskName: this.getContext().taskName,
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
		if (this.getContext().taskName) {
			aParams.push(this.getContext().taskName);
			sMessage += "\x1b[35m%s\x1b[0m ";
		}
		if (this.getContext().logPrefix) {
			aParams.push(this.getContext().logPrefix);
			sMessage += "\x1b[35m%s\x1b[0m ";
		}
		if (this.getContext().fileName) {
			let sOutFileName = this.getContext().fileName;
			if (loc) {
				const oLocation = loc as ESTree.SourceLocation;

				if (oLocation.start) {
					sOutFileName +=
						":" +
						oLocation.start.line +
						":" +
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
		level: string,
		sMessage: string,
		aParams: string[] = []
	) {
		switch (level) {
			case ReportLevel.WARNING:
				// eslint-disable-next-line no-console
				console.warn(sMessage, ...aParams);
				break;
			case ReportLevel.ERROR:
				// eslint-disable-next-line no-console
				console.error(sMessage, ...aParams);
				break;
			default:
				// eslint-disable-next-line no-console
				console.log(sMessage, ...aParams);
				break;
		}
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
		if (this.oMap.size === 0) {
			return;
		}
		const sReporter =
			this.getContext().logPrefix || this.getContext().taskName;
		this.setContext({logPrefix: "", fileName: ""});
		ConsoleReporter.log(level, "");
		ConsoleReporter.log(level, "Report for \x1b[31m%s\x1b[0m:", [
			sReporter,
		]);
		this.oMap.forEach((value, key) => {
			if (typeof value === "number") {
				this.report(level, key + ": " + value);
			} else {
				this.report(
					level,
					"value: " + key + ": entries: " + value.length
				);
			}
		});
		this.oMap.clear();
	}

	async finalize(): Promise<{}> {
		// empty, because of reasons
		return Promise.resolve({});
	}
}
