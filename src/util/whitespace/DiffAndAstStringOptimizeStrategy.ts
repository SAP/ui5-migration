import {Reporter} from "../../reporter/Reporter";
import {Range} from "../Range";

import {
	AstStringOptimizeStrategy,
	NodeFilter,
} from "./AstStringOptimizeStrategy";
import {DiffStringOptimizeStrategy} from "./DiffStringOptimizeStrategy";
import {StringOptimizeStrategy} from "./StringOptimizeStrategy";

export class DiffAndAstStringOptimizeStrategy
	implements StringOptimizeStrategy
{
	private reporter: Reporter;

	constructor(reporter?: Reporter) {
		this.reporter = reporter;
	}

	async optimizeString(original: string, modified: string): Promise<string> {
		const astStringOptimizeStrategy = new AstStringOptimizeStrategy(
			this.reporter
		);
		let optimized = modified;
		// diff algorithm messes up structural changes such as wrapping
		// everything inside a sap.ui.define and indenting everything the diff
		// algorithm will then outdent everything to keep close to the original
		if (
			!(await astStringOptimizeStrategy.hasStructuralChange(
				original,
				optimized
			))
		) {
			const diffOptimization = new DiffStringOptimizeStrategy(
				this.reporter
			);
			optimized = await diffOptimization.optimizeString(
				original,
				optimized
			);
			const changedLines = diffOptimization.getChangedRanges(
				original,
				optimized
			);

			const wasModifiedNodeFilter: NodeFilter = {
				isValid(node) {
					if (node.range) {
						const nodeRange = Range.fromArray(node.range);
						return changedLines.some(
							nodeRange.isOverlappedBy.bind(nodeRange)
						);
					}
					return true;
				},
			};
			astStringOptimizeStrategy.setFilter(wasModifiedNodeFilter);
		}
		return astStringOptimizeStrategy.optimizeString(original, optimized);
	}
}
