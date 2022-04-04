import {Reporter, ReportLevel} from "../../reporter/Reporter";

import * as StringWhitespaceUtils from "./StringWhitespaceUtils";
import {StringOptimizeStrategy} from "./StringOptimizeStrategy";

const esprima = require("esprima");

/**
 * processing direction
 * @type {{PRECEDING: string, SUCCEEDING: string}}
 */
enum PROCESS_DIRECTION {
	PRECEDING,
	SUCCEEDING,
}

const filterAstAttributes = ["type", "range", "loc"];

/**
 * Replacement function which performs a modification of the jsContent
 * @param jsContent javascript content, each js string character has a position in the array
 */
type ModifyArrayContentAction = (jsContent: string[]) => void;

export interface NodeFilter {
	isValid(node);
}

class AcceptAllNodeFilter implements NodeFilter {
	isValid(node) {
		return true;
	}
}

export class AstStringOptimizeStrategy implements StringOptimizeStrategy {
	private reporter: Reporter;
	private nodeFilter: NodeFilter;

	constructor(reporter?: Reporter) {
		this.reporter = reporter;
		this.nodeFilter = new AcceptAllNodeFilter();
	}
	private static keepPrecedingWhitespace(
		aOptimizedContent: string[],
		targetIndent: string,
		modifiedIndent: string,
		oModifiedNodeElement,
		reporter?: Reporter
	) {
		if (targetIndent !== modifiedIndent) {
			AstStringOptimizeStrategy.log(
				reporter,
				"AST: whitespace diff for preceding element"
			);
			AstStringOptimizeStrategy.log(
				reporter,
				"AST: remove",
				modifiedIndent
			);
			AstStringOptimizeStrategy.log(reporter, "AST: add", targetIndent);
			AstStringOptimizeStrategy.log(
				reporter,
				`AST: index: ${oModifiedNodeElement.range[0] - 1}`
			);
			if (reporter) {
				reporter.collect("AstStringOptimizeStrategy.preceding", 1);
			}
			AstStringOptimizeStrategy.modifyContent(
				aOptimizedContent,
				oModifiedNodeElement.range[0] - 1,
				modifiedIndent,
				targetIndent,
				PROCESS_DIRECTION.PRECEDING
			);
		}
	}

	private static keepSucceedingWhitespace(
		aOptimizedContent: string[],
		targetOutdent: string,
		modifiedOutdent: string,
		oModifiedNodeElement,
		reporter?: Reporter
	) {
		if (targetOutdent !== modifiedOutdent) {
			AstStringOptimizeStrategy.log(
				reporter,
				"AST: whitespace diff for succeeding element"
			);
			AstStringOptimizeStrategy.log(
				reporter,
				"AST: remove",
				modifiedOutdent
			);
			AstStringOptimizeStrategy.log(reporter, "AST: add", targetOutdent);
			AstStringOptimizeStrategy.log(
				reporter,
				`AST: index: ${oModifiedNodeElement.range[1]}`
			);
			if (reporter) {
				reporter.collect("AstStringOptimizeStrategy.succeeding", 1);
			}
			AstStringOptimizeStrategy.modifyContent(
				aOptimizedContent,
				oModifiedNodeElement.range[1],
				modifiedOutdent,
				targetOutdent,
				PROCESS_DIRECTION.SUCCEEDING
			);
		}
	}

	private static calculateLineLengths(original: string, oCurrentNode) {
		const inBetweenIndex = oCurrentNode.range[0];

		let lastIndex = original.length;
		let firstIndex = 0;
		for (let i = inBetweenIndex; i > 0; i--) {
			const str = original[i];
			if (StringWhitespaceUtils.isEOL(str)) {
				firstIndex = i;
				break;
			}
		}
		for (let i = inBetweenIndex; i < original.length; i++) {
			const str = original[i];
			if (StringWhitespaceUtils.isEOL(str)) {
				lastIndex = i;
				break;
			}
		}

		return lastIndex - firstIndex;
	}

	private static valuesDiffer(oNode1, oNode2) {
		const nodeValue1 = AstStringOptimizeStrategy.extractValue(oNode1);
		const nodeValue2 = AstStringOptimizeStrategy.extractValue(oNode2);
		return nodeValue1 && nodeValue2 && nodeValue1 !== nodeValue2;
	}

	private static extractValue(oNode) {
		if (!oNode) {
			return false;
		}
		if (oNode.type === "Literal") {
			return oNode.value;
		} else if (oNode.type === "Identifier") {
			return oNode.name;
		}
		return false;
	}

	private static isNullOrUndefined(oNode) {
		return oNode === undefined || oNode === null;
	}

	private iterateAstNode(
		oSourceNode,
		oModifiedNode,
		onDiff,
		oParentModifiedNode?
	) {
		if (
			typeof oSourceNode === "string" &&
			typeof oModifiedNode === "string"
		) {
			return;
		}
		const oOptions = {
			modified: false,
			locChange: false,
			added: false,
			newChild: false,
			newChildKey: "",
			prevChildKey: "",
			typeChange: false,
			valueChange: false,
			arrayMod: false,
			parent: oParentModifiedNode,
		};

		// compare arrays for their nodes (Identifiers and Literals as elements)
		if (Array.isArray(oModifiedNode) && Array.isArray(oSourceNode)) {
			const length = Math.max(oModifiedNode.length, oSourceNode.length);
			for (let i = 0; i < length; i++) {
				const oCurrentModifiedNode = oModifiedNode[i];
				const oCurrentSourceNode = oSourceNode[i];

				if (
					AstStringOptimizeStrategy.isNullOrUndefined(
						oCurrentModifiedNode
					) ||
					AstStringOptimizeStrategy.isNullOrUndefined(
						oCurrentSourceNode
					)
				) {
					oOptions.arrayMod = true;
					oOptions.modified = true;
				} else if (
					AstStringOptimizeStrategy.valuesDiffer(
						oCurrentModifiedNode,
						oCurrentSourceNode
					)
				) {
					oOptions.arrayMod = true;
					oOptions.valueChange = true;
					oOptions.modified = true;
				}
			}
		}

		let sPreviousKey;
		Object.keys(oModifiedNode).forEach(sModifiedNodeKey => {
			if (
				oModifiedNode[sModifiedNodeKey] !== undefined &&
				oModifiedNode[sModifiedNodeKey] !== null
			) {
				// exclude loc/range diffs
				// ignore range and loc
				if (["loc", "range"].includes(sModifiedNodeKey)) {
					if (
						JSON.stringify(oSourceNode[sModifiedNodeKey]) !==
						JSON.stringify(oModifiedNode[sModifiedNodeKey])
					) {
						oOptions.locChange = true;
						oOptions.modified = true;
					}
				} else {
					if (
						AstStringOptimizeStrategy.isNullOrUndefined(
							oSourceNode[sModifiedNodeKey]
						)
					) {
						oOptions.added = true;
						oOptions.newChild = oModifiedNode[sModifiedNodeKey];
						oOptions.newChildKey = sModifiedNodeKey;
						oOptions.prevChildKey = sPreviousKey;
						oOptions.modified = true;
					} else if (
						oModifiedNode[sModifiedNodeKey].type !==
						oSourceNode[sModifiedNodeKey].type
					) {
						oOptions.typeChange = true;
						oOptions.modified = true;
					}
				}
			}
			sPreviousKey = sModifiedNodeKey;
		});
		if (oOptions.modified) {
			const exitIteration = onDiff(oSourceNode, oModifiedNode, oOptions);
			if (exitIteration === false) {
				return;
			}
		}
		Object.keys(oSourceNode).forEach(sSourceNodeKey => {
			if (
				!filterAstAttributes.includes(sSourceNodeKey) &&
				oSourceNode[sSourceNodeKey] &&
				oModifiedNode[sSourceNodeKey]
			) {
				this.iterateAstNode(
					oSourceNode[sSourceNodeKey],
					oModifiedNode[sSourceNodeKey],
					onDiff,
					oModifiedNode
				);
			}
		});
	}

	private static getPrecedingNodeWhitespaces(sString, oNode) {
		if (oNode.range[0] === undefined) {
			return undefined;
		}
		const iIndex = oNode.range[0] - 1;
		return this.getPrecedingWhitespaces(sString, iIndex);
	}

	private static getPrecedingWhitespaces(sString, iIndex) {
		let sResult = "";
		for (let i = iIndex; i >= 0; i--) {
			const sChar = sString[i];
			if (StringWhitespaceUtils.isWhitespace(sChar)) {
				sResult = sChar + sResult;
			} else {
				break;
			}
		}
		// get location in source and iterate characters reverse until it is not
		// a whitespace character
		return sResult;
	}

	private static getSucceedingNodeWhitespaces(sString, oNode) {
		if (oNode.range[1] === undefined) {
			return undefined;
		}
		const iIndex = oNode.range[1];
		return this.getSucceedingWhitespaces(sString, iIndex);
	}

	private static getSucceedingWhitespaces(sString, iIndex) {
		let sResult = "";
		for (let i = iIndex; i < sString.length; i++) {
			const sChar = sString[i];
			if (StringWhitespaceUtils.isWhitespace(sChar)) {
				sResult += sChar;
			} else {
				break;
			}
		}
		return sResult;
	}

	private static getEOL(sString: string) {
		for (let i = 0; i < sString.length; i++) {
			const sChar = sString[i];
			const sChar2 = sString[i + 1];
			const combinedChar = sChar + (sChar2 ? sChar2 : "");
			if (sChar2) {
				i++;
			}
			if (StringWhitespaceUtils.isEOL(combinedChar)) {
				return combinedChar;
			}
		}
		return "";
	}

	private static getIndent(sString: string) {
		let result = "";
		for (let i = 0; i < sString.length; i++) {
			const sChar = sString[i];
			const sChar2 = sString[i + 1];
			const combinedChar = sChar + (sChar2 ? sChar2 : "");
			if (sChar2) {
				i++;
			}
			if (!StringWhitespaceUtils.isEOL(combinedChar)) {
				result += combinedChar;
			}
		}
		return result;
	}

	/**
	 * Validates the given string by parsing it as JS.
	 * - invalid: if parsing fails
	 * - valid: if parsing succeeds
	 * @param {string} jsString string which contains javascript source code, e.g. 'var x = 5;'
	 * @returns {boolean} whether or not given input string can be parsed to JS
	 */
	private static isStringValidJs(jsString) {
		try {
			esprima.parseScript(jsString);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 *
	 * @param {string[]} aOptimizedContent the array to modify
	 * @param {number} iIndex
	 * @param {string} whitespaceToRemove
	 * @param {string} whitespaceToAdd
	 * @param {PROCESS_DIRECTION} direction processing direction, either "preceding" or "succeeding"
	 */
	private static modifyContent(
		aOptimizedContent,
		iIndex: number,
		whitespaceToRemove: string,
		whitespaceToAdd: string,
		direction: PROCESS_DIRECTION
	) {
		const aOptimizedContentCopy = aOptimizedContent.slice();

		/**
		 * Collects actions to perform on a js string
		 * It is used for a simulation of a string modification and test it
		 * before applying it to the source code
		 * @param {string[]} aContent js content, each js string character has a position in the array
		 */
		const getActions = (aContent): ModifyArrayContentAction[] => {
			const aActions: ModifyArrayContentAction[] = [];
			let lastDeletedIndex = iIndex;
			if (direction === PROCESS_DIRECTION.PRECEDING) {
				for (let i = whitespaceToRemove.length - 1; i >= 0; i--) {
					const sWhitespaceChar = whitespaceToRemove[i];
					const iIndexToDelete =
						iIndex - (whitespaceToRemove.length - 1 - i);
					const sCharInMod = aContent[iIndexToDelete];
					if (sCharInMod === sWhitespaceChar) {
						aActions.push(aOptimizedContent => {
							aOptimizedContent[iIndexToDelete] = "";
						});
						lastDeletedIndex = iIndexToDelete;
					}
				}
			} else {
				for (let i = 0; i < whitespaceToRemove.length; i++) {
					const sWhitespaceChar = whitespaceToRemove[i];
					const iIndexToDelete = iIndex + i;
					if (aContent[iIndexToDelete] === sWhitespaceChar) {
						aActions.push(aOptimizedContent => {
							aOptimizedContent[iIndexToDelete] = "";
						});
					}
				}
			}
			if (
				!aContent[lastDeletedIndex] ||
				StringWhitespaceUtils.isWhitespace(aContent[lastDeletedIndex])
			) {
				aActions.push(aOptimizedContent => {
					aOptimizedContent[lastDeletedIndex] = whitespaceToAdd;
				});
			} else {
				if (direction === PROCESS_DIRECTION.PRECEDING) {
					aActions.push(aOptimizedContent => {
						aOptimizedContent[lastDeletedIndex] =
							aOptimizedContent[lastDeletedIndex] +
							whitespaceToAdd;
					});
				} else {
					aActions.push(aOptimizedContent => {
						aOptimizedContent[lastDeletedIndex] =
							whitespaceToAdd +
							aOptimizedContent[lastDeletedIndex];
					});
				}
			}
			return aActions;
		};

		/*
		 * Collect actions which modify a js string.
		 * Each modification might break the code represented by the js string
		 *
		 * E.g. whitespace modification, removal of a newline character ('\n')
		 * js string:	'// my comment\nvar x = function() {\n};\nvar y = 47;'
		 * mod string:	'// my commentvar x = function() {\n};\nvar y = 47;'
		 *
		 * after the modification the js string becomes invalid.
		 * Therefore each modification of the js string is first performed on a copy.
		 * Afterwards it is validated, before applying it to the original js string
		 */
		const aActions = getActions(aOptimizedContent);

		// execute actions on backup content
		aActions.forEach(action => {
			action(aOptimizedContentCopy);
		});

		// check if modification causes the JS to become invalid
		// if it is valid perform actions on actual array
		if (this.isStringValidJs(aOptimizedContentCopy.join(""))) {
			aActions.forEach(action => {
				action(aOptimizedContent);
			});
		}
	}

	private static log(reporter?: Reporter, str?: string, toEscape?: string) {
		if (reporter && str) {
			reporter.report(
				ReportLevel.TRACE,
				str + StringWhitespaceUtils.formatWhitespaceChars(toEscape)
			);
		}
	}

	private static isIIFEWithoutArgs(node) {
		return (
			node.type === "ExpressionStatement" &&
			node.expression.type === "CallExpression" &&
			node.expression.callee.type === "FunctionExpression" &&
			node.expression.arguments.length === 0
		);
	}

	private static hasFunctionCall(aSapUiDefineArguments) {
		const lastArgument =
			aSapUiDefineArguments[aSapUiDefineArguments.length - 1];
		if (lastArgument.type === "FunctionExpression") {
			return true;
		}
		if (
			aSapUiDefineArguments.length > 1 &&
			lastArgument.type === "Literal" &&
			typeof lastArgument.value === "boolean"
		) {
			const beforeLastArgument =
				aSapUiDefineArguments[aSapUiDefineArguments.length - 2];
			return (
				beforeLastArgument &&
				beforeLastArgument.type === "FunctionExpression"
			);
		}

		return false;
	}

	private static isSapUiDefineCall(node) {
		return (
			node.type === "ExpressionStatement" &&
			node.expression.type === "CallExpression" &&
			node.expression.callee.type === "MemberExpression" &&
			node.expression.callee.object.type === "MemberExpression" &&
			node.expression.callee.object.object.type === "Identifier" &&
			node.expression.callee.object.object.name === "sap" &&
			node.expression.callee.object.property.type === "Identifier" &&
			node.expression.callee.object.property.name === "ui" &&
			node.expression.callee.property.type === "Identifier" &&
			(node.expression.callee.property.name === "define" ||
				node.expression.callee.property.name === "require") &&
			node.expression.arguments.length > 0 &&
			AstStringOptimizeStrategy.hasFunctionCall(node.expression.arguments)
		);
	}

	private static isUseStrict(node): boolean {
		return (
			node.type === "ExpressionStatement" &&
			node.directive === "use strict" &&
			node.expression.type === "Literal" &&
			node.expression.value === "use strict"
		);
	}

	private static findUseStrict(oParsedModified) {
		let oUseStrict;
		Object.keys(oParsedModified).forEach(sChildKey => {
			if (
				!oUseStrict &&
				!filterAstAttributes.includes(sChildKey) &&
				oParsedModified[sChildKey]
			) {
				const oChild = oParsedModified[sChildKey];
				if (Array.isArray(oChild) || oChild.type) {
					if (AstStringOptimizeStrategy.isUseStrict(oChild)) {
						oUseStrict = oChild;
					} else {
						oUseStrict =
							AstStringOptimizeStrategy.findUseStrict(oChild);
					}
				}
			}
		});
		return oUseStrict;
	}

	async setFilter(nodeFilter: NodeFilter) {
		this.nodeFilter = nodeFilter;
	}

	async hasStructuralChange(
		original: string,
		modified: string
	): Promise<boolean> {
		const oOptions = {range: true, loc: true};
		const oParsedOriginal = esprima.parseScript(original, oOptions);
		const oParsedModified = esprima.parseScript(modified, oOptions);
		let result = true;
		this.iterateAstNode(
			oParsedOriginal,
			oParsedModified,
			(oSourceNode, oModifiedNode, oOptions) => {
				if (
					AstStringOptimizeStrategy.isSapUiDefineCall(
						oModifiedNode
					) &&
					(AstStringOptimizeStrategy.isSapUiDefineCall(oSourceNode) ||
						AstStringOptimizeStrategy.isIIFEWithoutArgs(
							oSourceNode
						))
				) {
					result = false;
					// break iteration
					return false;
				}
				// keep iterating
				return true;
			}
		);
		return result;
	}

	async optimizeString(original: string, modified: string): Promise<string> {
		if (this.reporter) {
			this.reporter.report(
				ReportLevel.TRACE,
				"Performing AstStringOptimizeStrategy"
			);
		}

		const oOptions = {range: true, loc: true};
		const oParsedOriginal = esprima.parseScript(original, oOptions);
		const oParsedModified = esprima.parseScript(modified, oOptions);
		const aOptimizedContent = modified.split("");

		const oUseStrictModifiedNode =
			AstStringOptimizeStrategy.findUseStrict(oParsedModified);
		if (oUseStrictModifiedNode) {
			const useStrictPrec =
				AstStringOptimizeStrategy.getPrecedingNodeWhitespaces(
					modified,
					oUseStrictModifiedNode
				);
			let targetIndent;
			const oUseStrictOrigNode =
				AstStringOptimizeStrategy.findUseStrict(oParsedOriginal);
			if (oUseStrictOrigNode) {
				targetIndent =
					AstStringOptimizeStrategy.getPrecedingNodeWhitespaces(
						original,
						oUseStrictOrigNode
					);
			} else {
				const useStrictSucc =
					AstStringOptimizeStrategy.getSucceedingNodeWhitespaces(
						modified,
						oUseStrictModifiedNode
					);
				targetIndent =
					AstStringOptimizeStrategy.getEOL(useStrictSucc) +
					AstStringOptimizeStrategy.getIndent(useStrictSucc);
			}
			AstStringOptimizeStrategy.keepPrecedingWhitespace(
				aOptimizedContent,
				targetIndent,
				useStrictPrec,
				oUseStrictModifiedNode,
				this.reporter
			);
		}
		const localNodeFilter = this.nodeFilter;
		const localReporter = this.reporter;

		// check each node which was modified (from ORIG to MOD)
		const onDiff = function (oSourceNode, oModifiedNode, oOptions) {
			// address only additions
			if (
				!oOptions.added &&
				!oOptions.valueChange &&
				!oOptions.arrayMod
			) {
				return;
			}

			// types must match
			if (oSourceNode.type !== oModifiedNode.type) {
				return;
			}

			if (oOptions.parent && oOptions.parent.type === "BlockStatement") {
				return;
			}

			if (!localNodeFilter.isValid(oOptions.parent)) {
				return;
			}

			// TODO mark complete array as dirty and get the following
			if (
				Array.isArray(oModifiedNode) &&
				Array.isArray(oSourceNode) &&
				oModifiedNode.length > 0 &&
				oSourceNode.length > 0
			) {
				// analyze source style

				// first element indent of orig
				// first element outdent of orig
				const firstTargetIndent =
					AstStringOptimizeStrategy.getPrecedingNodeWhitespaces(
						original,
						oSourceNode[0]
					);
				// TODO find most common outdent instead of first one
				let firstTargetOutdent =
					AstStringOptimizeStrategy.getSucceedingNodeWhitespaces(
						original,
						oSourceNode[0]
					);

				// last element indent of orig
				// last element outdent of orig
				// TODO find most common indent instead of last one
				let lastTargetIndent =
					AstStringOptimizeStrategy.getPrecedingNodeWhitespaces(
						original,
						oSourceNode[oSourceNode.length - 1]
					);
				const lastTargetOutdent =
					AstStringOptimizeStrategy.getSucceedingNodeWhitespaces(
						original,
						oSourceNode[oSourceNode.length - 1]
					);

				if (oSourceNode.length === 1) {
					lastTargetIndent = " ";
					firstTargetOutdent = "";
				}

				// find the irregulars which do not follow the common style
				// e.g. multiple entries per line

				const styles = [];
				if (oSourceNode.length > 1) {
					oSourceNode.slice(1).forEach(oCurrentNode => {
						const currentModifiedIndent =
							AstStringOptimizeStrategy.getPrecedingNodeWhitespaces(
								original,
								oCurrentNode
							);
						if (currentModifiedIndent !== lastTargetIndent) {
							const previousNode =
								oSourceNode[
									oSourceNode.indexOf(oCurrentNode) - 1
								];
							styles.push({
								lineLength:
									AstStringOptimizeStrategy.calculateLineLengths(
										original,
										previousNode
									),
								lineBreakIndex:
									oSourceNode.indexOf(oCurrentNode),
								lineBreakStyle: currentModifiedIndent,
							});
						}
					});
				}

				// this is the target style!

				const firstModifiedIndent =
					AstStringOptimizeStrategy.getPrecedingNodeWhitespaces(
						modified,
						oModifiedNode[0]
					);
				AstStringOptimizeStrategy.keepPrecedingWhitespace(
					aOptimizedContent,
					firstTargetIndent,
					firstModifiedIndent,
					oModifiedNode[0],
					localReporter
				);

				// indent each node but the first one
				oModifiedNode.slice(1).forEach(oCurrentNode => {
					let targetIndent = lastTargetIndent;
					if (styles.length > 0) {
						const currentNodeIndex =
							oModifiedNode.indexOf(oCurrentNode);
						const style = styles[0];
						if (currentNodeIndex === style.lineBreakIndex) {
							styles.splice(0, 1);
							targetIndent = style.lineBreakStyle;
						}
					}
					const currentModifiedIndent =
						AstStringOptimizeStrategy.getPrecedingNodeWhitespaces(
							modified,
							oCurrentNode
						);
					AstStringOptimizeStrategy.keepPrecedingWhitespace(
						aOptimizedContent,
						targetIndent,
						currentModifiedIndent,
						oCurrentNode,
						localReporter
					);
				});

				// outdent each but the last node
				oModifiedNode
					.slice(0, oModifiedNode.length - 1)
					.forEach(oCurrentNode => {
						const currentModifiedOutdent =
							AstStringOptimizeStrategy.getSucceedingNodeWhitespaces(
								modified,
								oCurrentNode
							);
						AstStringOptimizeStrategy.keepSucceedingWhitespace(
							aOptimizedContent,
							firstTargetOutdent,
							currentModifiedOutdent,
							oCurrentNode,
							localReporter
						);
					});

				const lastModifiedOutdent =
					AstStringOptimizeStrategy.getSucceedingNodeWhitespaces(
						modified,
						oModifiedNode[oModifiedNode.length - 1]
					);
				AstStringOptimizeStrategy.keepSucceedingWhitespace(
					aOptimizedContent,
					lastTargetOutdent,
					lastModifiedOutdent,
					oModifiedNode[oModifiedNode.length - 1],
					localReporter
				);
			}

			// use formatting for each element in the array

			// AstStringOptimizeStrategy.modifyArray(oOptions, modified,
			// oModifiedNode, this, aOptimizedContent, original, oSourceNode);
		};
		this.iterateAstNode(oParsedOriginal, oParsedModified, onDiff);

		// whitespaces array element indentation:
		// TODO: check if it makes sense to check for array or to check for
		// arguments check surrounding nodes (previous) check if there are
		// whitespaces differences if there is one use existing whitespace from
		// surrounding nodes (previous)

		return aOptimizedContent.join("");
	}
}
