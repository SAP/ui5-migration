export enum AnalyzeCharacter {
	NEWLINE,
	INDENT,
}

export class CodeStyleAnalyzer {
	private sSource: string;
	private result = new Map();

	constructor(sSource: string) {
		this.sSource = sSource;
		this.analyze();
	}

	private analyze() {
		const rNewlineN = /\n/g;
		const rNewlineRN = /\r\n/g;

		const countNewlinesN = this.sSource.split(rNewlineN).length - 1;
		const countNewlinesRN = this.sSource.split(rNewlineRN).length - 1;

		const rTabs = /\n(\t+)/g;
		const rSpaces4 = /\n([ ]{4})\S/g;
		const rSpaces2 = /\n([ ]{2})\S/g;

		let eofChar = undefined;
		if (countNewlinesN > countNewlinesRN) {
			eofChar = "N";
		} else if (countNewlinesRN >= countNewlinesN) {
			eofChar = "RN";
		}

		const countTabs = this.sSource.split(rTabs).length - 1;
		const countSpaces2 = this.sSource.split(rSpaces2).length - 1;
		const countSpaces4 = this.sSource.split(rSpaces4).length - 1;

		let spaceChar = undefined;
		if (countTabs > countSpaces2 && countTabs > countSpaces4) {
			spaceChar = true;
			// with 4 space indent there cannot be any 2 space indent
		} else if (countSpaces4 > 0 && countSpaces2 === 0) {
			spaceChar = 4;
			// with 2 space indent there can be 4 space indent
		} else if (countSpaces2 > 0) {
			spaceChar = 2;
		}

		this.result.set(AnalyzeCharacter.NEWLINE, eofChar);
		this.result.set(AnalyzeCharacter.INDENT, spaceChar);
	}

	getMostCommon(char: AnalyzeCharacter) {
		return this.result.get(char);
	}
}
