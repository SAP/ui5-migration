import * as ESTree from "estree";

import {ConsoleReporter} from "./ConsoleReporter";
import {Finding, Reporter, ReportLevel} from "./Reporter";

export class MetaConsoleReporter extends ConsoleReporter {
	oReporters: { [index: string]: Reporter };
	findings: Finding[];

	constructor(level: ReportLevel) {
		super(level);
		this.oReporters = {};
		this.findings = [];
	}

	createReporter(level: ReportLevel): Reporter {
		return new ConsoleReporter(level);
	}

	registerReporter(sName: string): Reporter {
		let oReporter = this.getReporter(sName);
		if (!oReporter) {
			oReporter = this.createReporter(this.sLevel);
			oReporter.setContext({ taskName : sName });
			this.oReporters[sName] = oReporter;
		}
		return oReporter;
	}

	getReporter(sName: string): Reporter {
		return this.oReporters[sName];
	}

	getReporters(): Reporter[] {
		return Object.keys(this.oReporters)
			.map((sKey) => this.oReporters[sKey]);
	}

	storeFinding(msg: string, loc?: ESTree.SourceLocation) {
		this.findings.push({ filename : "meta", taskName : "meta", loc, msg });
	}

	/**
	 * get reported entries
	 */
	getFindings(): Finding[] {
		let results = this.findings.slice();
		this.getReporters().forEach((oReporter) => {
			results = results.concat(oReporter.getFindings());
		});
		return results;
	}

	reportCollected(level: ReportLevel) {
		super.reportCollected(level);
		this.getReporters().forEach(
			(oReporter) => oReporter.reportCollected(level));
	}

	collect(sKey: string, oValue: string|number) {
		super.collect(sKey, oValue);
		this.getReporters().forEach(
			(oReporter) => oReporter.collect(sKey, oValue));
	}

	collectTopLevel(sKey: string, oValue: string|number) {
		super.collect(sKey, oValue);
	}

	async finalize(): Promise<{}> {
		const that = this;
		return super.finalize().then(function() {
			return Promise.all(
				that.getReporters().map((oReporter) => oReporter.finalize()));
		});
	}
}
