import * as ESTree from "estree";

import {Finding, fromLoc, ReportContext, Reporter, ReportLevel} from "./Reporter";

/**
 * Represents a reporter base class which can:
 * * handle findings
 * * handle a context
 */
export abstract class BaseReporter implements Reporter {
	findings: Finding[];
	oReportContext: ReportContext;

	protected constructor() {
		this.findings = [];
		this.oReportContext = {};
	}

	/**
	 * get reported entries
	 */
	getFindings(): Finding[] {
		return this.findings;
	}

	/**
	 * Stores a finding
	 * @param message the message
	 * @param loc source code location
	 */
	storeFinding(message: string, loc?: ESTree.SourceLocation) {
		this.findings.push({
			fileName : this.oReportContext.fileName,
			location : fromLoc(loc),
			message,
			taskName : this.oReportContext.taskName
		});
	}

	/**
	 * Set the context of the reporter
	 * @param oReportContext
	 */
	setContext(oReportContext: ReportContext): void {
		this.oReportContext = oReportContext;
	}

	/**
	 * Retrieves the context of the reporter
	 */
	getContext(): ReportContext {
		return this.oReportContext;
	}

	collect(sKey: string, sValue: string|number): void {
	}

	finalize(): Promise<{}> {
		return undefined;
	}

	report(level: ReportLevel, msg: string, loc?: ESTree.SourceLocation): void {
	}

	reportCollected(level: ReportLevel): void {
	}
}