// input string
// object to modify

// find node in string and position
// https://github.com/vtrushin/json-to-ast

const parse = require("json-to-ast");

import {AnalyzeCharacter, CodeStyleAnalyzer} from "../CodeStyleAnalyzer";
import * as StringWhitespaceUtils from "../whitespace/StringWhitespaceUtils";

interface Location {
	start: Position;
	end: Position;
}

interface Position {
	line: number;
	column: number;
	offset: number;
}

export class ModifyJSONContent {
	private content: string;
	private modifiedContent: string;
	private settings: {loc: boolean};
	private oContent;
	private contentLines: string[];
	private eol: string;
	private indent: string;

	constructor(content) {
		this.content = content;
		this.init(content);
	}

	private init(content) {
		this.eol = this.calculateEOL(content);
		this.indent = this.calculateIndent(content);
		this.contentLines = content.split(this.eol);
		this.modifiedContent = content;
		this.settings = {
			// Appends location information. Default is <true>
			loc: true,
		};
		this.oContent = this.parse(content);
	}

	private calculateEOL(content) {
		return new CodeStyleAnalyzer(content).getMostCommon(
			AnalyzeCharacter.NEWLINE
		) === "N"
			? "\n"
			: "\r\n";
	}

	private calculateIndent(content) {
		const indent = new CodeStyleAnalyzer(content).getMostCommon(
			AnalyzeCharacter.INDENT
		);
		if (indent === true) {
			return "\t";
		}
		if (typeof indent === "number") {
			return " ".repeat(indent);
		}
		return "\t"; // default
	}

	private parse(content) {
		return parse(content, this.settings);
	}

	/**
	 *
	 * @param {string[]} aPath list of strings
	 * @returns {Object} position
	 */
	find(aPath: string[]) {
		let resultElement = this.oContent;
		let found = true;
		aPath.forEach(path => {
			if (found) {
				const tempResult = this.findChild(resultElement, path);
				if (tempResult === undefined) {
					found = false;
				}
				resultElement = tempResult;
			}
		});
		if (found) {
			return resultElement;
		}
		return undefined;
	}

	private getInsertPosition(element): Position {
		if (element.children) {
			return element.children[element.children.length - 1].loc.end;
		}
		return element.loc.start;
	}

	private findChild(currentObject, elementName: string) {
		let resultChild;
		currentObject.children.forEach(child => {
			if (child.key.value === elementName) {
				resultChild = child.value;
			}
		});
		return resultChild;
	}

	replace(aPath, oContent) {
		const contentLinesBackup = this.contentLines.slice();
		const oElement = this.find(aPath);

		const startLine = (oElement.loc as Location).start.line - 1;
		const endLine = (oElement.loc as Location).end.line - 1;

		const lastElement = aPath.slice().pop();

		const nextLine = this.contentLines[startLine + 1];
		const currentLine = this.contentLines[startLine];
		let commaRequired = true;
		if (nextLine.trim().startsWith("}")) {
			commaRequired = false;
		}
		const targetIndent = this.getIndent(currentLine);
		if (startLine === endLine) {
			this.contentLines.splice(startLine, 1);
		} else {
			for (let i = startLine; i < endLine; i++) {
				this.contentLines.splice(i, 1);
			}
		}
		this.contentLines.splice(
			startLine,
			0,
			targetIndent + '"' + lastElement + '": {'
		);

		const insertLine = startLine + 1;
		// new content
		const newString = this.extractContent(oContent);

		const aNewLines = newString.split("\n").filter(Boolean);

		// insert
		let lastPos = insertLine;
		aNewLines.forEach(newLine => {
			this.contentLines.splice(lastPos++, 0, targetIndent + newLine);
		});

		this.contentLines.splice(
			lastPos,
			0,
			targetIndent + "}" + (commaRequired ? "," : "")
		);

		// update content
		try {
			// verify content
			JSON.stringify(this.getContent());
			this.update();
		} catch (e) {
			this.contentLines = contentLinesBackup;
			throw e;
		}
	}

	private extractContent(oContent) {
		let newString = JSON.stringify(oContent, null, this.indent);
		if (newString.startsWith("{") && newString.endsWith("}")) {
			newString = newString.substring(1, newString.length - 1);
		}
		return newString;
	}

	add(aPath, oContent) {
		const contentLinesBackup = this.contentLines.slice();
		const oElement = this.find(aPath);
		const insertPosition = this.getInsertPosition(oElement) as Position;
		const previousLine = this.contentLines[insertPosition.line - 1];
		const targetIndent = this.getIndent(previousLine);

		// new content
		const newString = this.extractContent(oContent);

		const aNewLines = newString.split("\n").filter(Boolean);
		const newCodeIndent = this.getIndent(aNewLines[0]);

		// insert
		let lastPos = insertPosition.line;
		aNewLines.forEach(newLine => {
			this.contentLines.splice(
				lastPos++,
				0,
				targetIndent + newLine.substring(newCodeIndent.length)
			);
		});

		// restore comma
		if (oElement.children && oElement.children.length > 0) {
			this.contentLines[insertPosition.line - 1] =
				this.contentLines[insertPosition.line - 1] + ",";
		}
		// update content
		try {
			// verify content
			JSON.stringify(this.getContent());
			this.update();
		} catch (e) {
			this.contentLines = contentLinesBackup;
			throw e;
		}
	}

	private update() {
		this.init(this.getContent());
	}

	getContent() {
		return this.contentLines.join(this.eol);
	}

	static create(content) {
		return new ModifyJSONContent(content);
	}

	private getIndent(previousLine: string) {
		const aChars = previousLine.split("");
		let result = "";
		let valid = true;
		aChars.forEach(char => {
			if (valid) {
				if (StringWhitespaceUtils.isWhitespace(char)) {
					result += char;
				} else {
					valid = false;
				}
			}
		});
		return result;
	}
}
