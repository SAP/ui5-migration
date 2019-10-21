function escapeControlChars(cChar) {
	if (cChar === "\n") {
		return "\\n";
	} else if (cChar === "\t") {
		return "\\t";
	} else if (cChar === "\r") {
		return "\\r";
	}
	return cChar;
}

export function formatWhitespaceChars(toEscape) {
	let sAdd = "";
	if (toEscape === "") {
		sAdd += " '[]'";
	} else if (toEscape) {
		sAdd += " '";
		for (let i = 0; i < toEscape.length; i++) {
			sAdd += "[" + escapeControlChars(toEscape[i]) + "]";
		}
		sAdd += "'";
	}
	return sAdd;
}
const rIsWhitespace = /^\s+$/;
export function isWhitespace(str: string): boolean {
	return rIsWhitespace.test(str);
}

const rIsCharacter = /^[A-Za-z0-9]$/;
export function isCharacter(str: string): boolean {
	return rIsCharacter.test(str);
}

const rIsNewline = /^\r?\n$/;
export function isEOL(str: string): boolean {
	return rIsNewline.test(str);
}

const rContainsNewline = /\r?\n/;
export function splitLines(str: string): string[] {
	return str.split(rContainsNewline);
}
