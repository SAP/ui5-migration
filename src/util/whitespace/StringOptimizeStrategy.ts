export interface StringOptimizeStrategy {
	/**
	 *
	 * @param original
	 * @param modified
	 */
	optimizeString(original: string, modified: string): Promise<string>;
}
