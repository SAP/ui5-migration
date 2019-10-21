/**
 * Optimizes the diff between 2 strings regarding whitespaces
 */
import {Reporter} from "../../reporter/Reporter";

import {DiffAndAstStringOptimizeStrategy} from "./DiffAndAstStringOptimizeStrategy";

export async function optimizeString(
	original: string,
	modified: string,
	oReporter?: Reporter,
	strategy: StringOptimizeStrategy = new DiffAndAstStringOptimizeStrategy(
		oReporter
	)
): Promise<string> {
	return strategy.optimizeString(original, modified);
}
