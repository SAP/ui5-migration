import {ConsoleReporter} from "./ConsoleReporter";
import {Reporter, ReportLevel} from "./Reporter";

export class MetaConsoleReporter extends ConsoleReporter {
	oReporters: { [index: string]: Reporter };

	constructor(level: ReportLevel) {
		super(level);
		this.oReporters = {};
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
