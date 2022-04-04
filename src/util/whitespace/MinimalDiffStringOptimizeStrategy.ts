import {Reporter} from "../../reporter/Reporter";

import {AstStringOptimizeStrategy} from "./AstStringOptimizeStrategy";
import {DiffStringOptimizeStrategy} from "./DiffStringOptimizeStrategy";
import {StringOptimizeStrategy} from "./StringOptimizeStrategy";

/**
 * Greedy algorithm which focuses on the most minimal DIFF.
 * Structural changes such as wrapping everything inside a sap.ui.define
 * function will not cause indentation
 */
export class MinimalDiffStringOptimizeStrategy
	implements StringOptimizeStrategy
{
	private reporter: Reporter;

	constructor(reporter?: Reporter) {
		this.reporter = reporter;
	}

	async optimizeString(original: string, modified: string): Promise<string> {
		const optimized = await new DiffStringOptimizeStrategy(
			this.reporter
		).optimizeString(original, modified);
		return new AstStringOptimizeStrategy(this.reporter).optimizeString(
			original,
			optimized
		);
	}
}
