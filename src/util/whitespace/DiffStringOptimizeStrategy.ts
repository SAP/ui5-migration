import {Reporter, ReportLevel} from "../../reporter/Reporter";
import {Range} from "../Range";

import * as StringWhitespaceUtils from "./StringWhitespaceUtils";
import {StringOptimizeStrategy} from "./StringOptimizeStrategy";

const diff = require("diff");

export class DiffStringOptimizeStrategy implements StringOptimizeStrategy {
	private reporter: Reporter;

	constructor(reporter?: Reporter) {
		this.reporter = reporter;
	}

	getChangedRanges(original: string, modified: string): Range[] {
		const aResult: Range[] = [];
		let iCount = 0;
		// const aDiffWords = diff.diffWordsWithSpace(original, modified);
		const aDiffWords = diff.diffLines(original, modified, {
			ignoreWhitespace: true,
		});
		for (let i = 0; i < aDiffWords.length; i++) {
			const oResultElement = aDiffWords[i];
			const sLength = oResultElement.value.length;
			// ignore removed elements
			if (oResultElement.added) {
				aResult.push(Range.from(iCount, iCount + sLength));
			}

			if (!oResultElement.removed) {
				iCount += sLength;
			}
		}
		return aResult;
	}

	async optimizeString(original: string, modified: string): Promise<string> {
		let sIgnoreWhitespaceChanges = "";

		if (this.reporter) {
			this.reporter.report(
				ReportLevel.TRACE,
				`Performing DiffStringOptimizeStrategy ${original.length} and ${modified.length}`
			);
		}

		// use diff with words to minimize false positives
		// diffs two blocks of text, comparing word by word, treating whitespace
		// as significant.
		const aResult = diff.diffWordsWithSpace(original, modified);
		if (this.reporter) {
			this.reporter.report(
				ReportLevel.TRACE,
				`DIFF: Found ${aResult.length} diffs`
			);
		}
		let iIndex = 0;
		aResult.forEach(oChange => {
			iIndex = sIgnoreWhitespaceChanges.length;
			if (oChange.removed === undefined && oChange.added === undefined) {
				// neither added nor removed
				// safely apply the changes
				sIgnoreWhitespaceChanges += oChange.value;
			} else if (oChange.added && oChange.removed === undefined) {
				// skip whitespaces
				if (StringWhitespaceUtils.isWhitespace(oChange.value)) {
					if (this.reporter) {
						this.reporter.collect(
							"DiffStringOptimizeStrategy.skipped",
							1
						);
						this.reporter.report(
							ReportLevel.TRACE,
							`DIFF Skipped ${iIndex}: ${StringWhitespaceUtils.formatWhitespaceChars(
								oChange.value
							)}`
						);
					}
				} else {
					// add non-whitespace changes
					sIgnoreWhitespaceChanges += oChange.value;
				}
			} else if (oChange.removed && oChange.added === undefined) {
				// add whitespace change if it was removed
				if (StringWhitespaceUtils.isWhitespace(oChange.value)) {
					sIgnoreWhitespaceChanges += oChange.value;
					if (this.reporter) {
						this.reporter.collect(
							"DiffStringOptimizeStrategy.added",
							1
						);
						this.reporter.report(
							ReportLevel.TRACE,
							`DIFF Added ${iIndex}: ${StringWhitespaceUtils.formatWhitespaceChars(
								oChange.value
							)}`
						);
					}
				}
			}
		});

		return sIgnoreWhitespaceChanges;
	}
}
