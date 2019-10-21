import * as ESTree from "estree";

import {SapUiDefineCall} from "./util/SapUiDefineCall";

export const EMPTY_FINDER_RESULT: FinderResult = {
	configName: "",
};

export function FOUND_RESULT(sConfigName): FinderResult {
	return {configName: sConfigName};
}

/**
 * Represents a module which analyzes an AST node and either returns a result or
 * an EMPTY_FINDER_RESULT (if nothing was found)
 */
export interface Finder {
	/**
	 *
	 * @param {ESTree.Node} node a node within the AST
	 * @param {object} config configuration object which can be enriched as it gets
	 * passed through to replacer and extender
	 * @param {string} sConfigName the input config name, set it within the
	 * @param {SapUiDefineCall} defineCall the definecall, e.g. can be used to perform dependency checks
	 * @returns {FinderResult} to indicate a finding
	 */
	find(
		node: ESTree.Node,
		config: {},
		sConfigName: string,
		defineCall: SapUiDefineCall
	): FinderResult;
}

/**
 * Use EMPTY_FINDER_RESULT to represent an empty finder result
 *
 * Otherwise set the passed configName as result like FOUND_RESULT
 */
export interface FinderResult {
	configName: string;
}

/**
 * Extender runs after Finder and Replacer
 * It can be used to modify the SapUiDefineCall
 */
export interface Extender {
	/**
	 *
	 * @param {SapUiDefineCall} defineCall the module's define call
	 * @param {object} config is passed along from finder and replacer
	 * @returns {boolean} whether or not the defineCall was modified
	 */
	extend(defineCall: SapUiDefineCall, config: {}): boolean;
}
