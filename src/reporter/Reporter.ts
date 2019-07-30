import * as ESTree from "estree";

/**
 * Report Level similar to Log level. Used to narrow down reported information.
 * TRACE is the most verbose level while ERROR is the most strict level.
 * This means that the TRACE level also includes the ERROR logs
 */
export enum ReportLevel {
	ERROR = "error",
	WARNING = "warning",
	INFO = "info",
	DEBUG = "debug",
	TRACE = "trace",
}

// sorted from low to high severity
const reportLevels: ReportLevel[] = [
	ReportLevel.TRACE,
	ReportLevel.DEBUG,
	ReportLevel.INFO,
	ReportLevel.WARNING,
	ReportLevel.ERROR,
];

/**
 *
 * Compares two ReportLevels to find out if the currentLevel is at least as
 * verbose as the requiredLevel.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 *
 * @param {ReportLevel} currentLevel the current level e.g. TRACE
 * @param {ReportLevel} requiredLevel the minimal level required e.g. INFO
 * @returns {number} -1 if the current level is more verbose than the required level, 1 otherwise
 */
export function CompareReportLevel(
	currentLevel: ReportLevel,
	requiredLevel: ReportLevel
): number {
	if (typeof currentLevel === "string" && typeof requiredLevel === "string") {
		const iResult =
			reportLevels.indexOf(currentLevel) -
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

/**
 * Transforms an ESTree.SourceLocation into a FindingLocation.
 * Because the ESTree.SourceLocation contains too many properties while
 * FindingLocation only contains the needed properties.
 * @param loc
 */
export function fromLoc(loc: ESTree.SourceLocation): FindingLocation {
	if (!loc) {
		return {endLine: 0, endColumn: 0, startLine: 0, startColumn: 0};
	}
	return {
		endLine: loc.end.line,
		endColumn: loc.end.column,
		startLine: loc.start.line,
		startColumn: loc.start.column,
	};
}

/**
 * Source code location
 */
export interface FindingLocation {
	endLine: number;
	endColumn: number;
	startLine: number;
	startColumn: number;
}

/**
 * Represents a Finding of code to replace
 */
export interface Finding {
	message: string;
	location: FindingLocation;
	fileName: string;
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
	collect(sKey: string, sValue: string | number): void;

	/**
	 * reports the collected information
	 */
	reportCollected(level: ReportLevel): void;

	/**
	 * finalizes the report
	 */
	finalize(): Promise<{}>;

	setContext(oContext: ReportContext): void;

	getContext(): ReportContext;
}
