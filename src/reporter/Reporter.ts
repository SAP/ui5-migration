import * as ESTree from "estree";

export enum ReportLevel {
	ERROR = "error",
	WARNING = "warning",
	INFO = "info",
	DEBUG = "debug",
	TRACE = "trace"
}

// sorted from low to high severity
const reportLevels: ReportLevel[] = [
	ReportLevel.TRACE, ReportLevel.DEBUG, ReportLevel.INFO, ReportLevel.WARNING,
	ReportLevel.ERROR
];

/**
 *
 * @param {ReportLevel} currentLevel TRACE
 * @param {ReportLevel} requiredLevel INFO
 * @returns {number} -1 if
 * @constructor
 */
export function CompareReportLevel(
	currentLevel: ReportLevel, requiredLevel: ReportLevel): number {
	if (typeof currentLevel === "string" && typeof requiredLevel === "string") {
		const iResult = reportLevels.indexOf(currentLevel) -
			reportLevels.indexOf(requiredLevel);
		return Math.max(-1, Math.min(iResult, 1));
	}
	throw new Error("Invalid Log Levels");
}

export interface ReportContext {
	fileName?: string;
	taskName?: string;
	logPrefix?: string;
}

export function fromLoc(loc: ESTree.SourceLocation): FindingLocation {
	if (!loc) {
		return { endLine : 0, endColumn : 0, startLine : 0, startColumn : 0 };
	}
	return {
		endLine : loc.end.line,
		endColumn : loc.end.column,
		startLine : loc.start.line,
		startColumn : loc.start.column
	};
}

export interface FindingLocation {
	endLine: number;
	endColumn: number;
	startLine: number;
	startColumn: number;
}

export interface Finding {
	msg: string;
	location: FindingLocation;
	filename: string;
	taskName: string;
}

/**
 * Used by migration modules to report information or errors.
 *
 * @export
 */
export interface Reporter {
	/**
	 * Used as logger
	 * @param {module:ui5-migration.ReportLevel} level
	 * @param {string} msg
	 * @param {Node | SourceLocation} loc
	 */
	report(level: ReportLevel, msg: string, loc?: ESTree.SourceLocation): void;

	/**
	 * persists the finding
	 * @param msg
	 * @param loc
	 */
	storeFinding(msg: string, loc?: ESTree.SourceLocation);

	/**
	 * get reported entries
	 */
	getFindings(): Finding[];
	/**
	 * stores report relevant information
	 * @param {string} sKey
	 * @param {string | number} sValue
	 */
	collect(sKey: string, sValue: string|number): void;

	/**
	 * reports the collected information
	 */
	reportCollected(level: ReportLevel): void;

	finalize(): Promise<{}>;

	setContext(oContext: ReportContext): void;

	getContext(): ReportContext;
}