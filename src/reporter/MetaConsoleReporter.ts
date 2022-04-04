import * as ESTree from "estree";

import {ConsoleReporter} from "./ConsoleReporter";
import {Finding, Reporter, ReportLevel} from "./Reporter";

/**
 * Reporter which contains multiple ConsoleReporters
 */
export class MetaConsoleReporter extends ConsoleReporter {
	oReporters: {[index: string]: Reporter};
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
			oReporter.setContext({taskName: sName});
			this.oReporters[sName] = oReporter;
		}
		return oReporter;
	}

	getReporter(sName: string): Reporter {
		return this.oReporters[sName];
	}

	getReporters(): Reporter[] {
		return Object.keys(this.oReporters).map(sKey => this.oReporters[sKey]);
	}

	storeFinding(message: string, loc?: ESTree.SourceLocation) {
		// NOOP since this is only handling a set of ConsoleReporters
	}

	/**
	 * get reported entries from all its nested reporters
	 */
	getFindings(): Finding[] {
		let results = this.findings.slice();
		this.getReporters().forEach(oReporter => {
			results = results.concat(oReporter.getFindings());
		});
		return results;
	}

	reportCollected(level: ReportLevel) {
		super.reportCollected(level);
		this.getReporters().forEach(oReporter =>
			oReporter.reportCollected(level)
		);
	}

	collect(sKey: string, oValue: string | number) {
		super.collect(sKey, oValue);
		this.getReporters().forEach(oReporter =>
			oReporter.collect(sKey, oValue)
		);
	}

	collectTopLevel(sKey: string, oValue: string | number) {
		super.collect(sKey, oValue);
	}

	async finalize(): Promise<{}> {
		return super.finalize().then(() => {
			return Promise.all(
				this.getReporters().map(oReporter => oReporter.finalize())
			);
		});
	}
}
