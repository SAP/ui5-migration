function randInt(min, max) {
	return min + ((Math.random() * (max - min + 1)) | 0);
}

function randOf(arr) {
	return arr[randInt(0, arr.length - 1)];
}

function randOfStr(str) {
	return str.charAt(randInt(0, str.length - 1));
}

function randArr(min, max, cb) {
	const arr = [];
	const c = randInt(min, max);
	for (let i = 0; i < c; i++) {
		arr.push(cb(i));
	}
	return arr;
}

/**
 * Generates random javascript source with at least minNodes AST nodes.
 * Although the source has correct syntax, you should *not* execute it,
 * as its behaviour is undefined
 *
 * @param {any} minNodes minimal count of AST nodes
 * @returns {string} random javascript code
 * @export
 */
export function genRandomJS(minNodes) {
	function genIdentifier() {
		const FIRST_ALPHABET =
			"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
		const ALPHABET = FIRST_ALPHABET + "0123456789";
		const PROHIBITED = [
			"var",
			"function",
			"while",
			"do",
			"for",
			"let",
			"const",
			"class",
			"new",
			"Array",
			"return",
			"switch",
			"case",
			"if",
			"else",
			"try",
			"catch",
			"throw",
			"break",
			"continue",
			"default",
			"delete",
			"false",
			"true",
			"goto",
			"finally",
			"in",
			"typeof",
			"yield",
			"await",
			"arguments",
			"volatile",
			"static",
			"null",
			"undefined",
			"eval",
		];

		minNodes--;
		let candidate;
		do {
			candidate =
				randOfStr(FIRST_ALPHABET) +
				randArr(0, 5, i => randOfStr(ALPHABET)).join("");
		} while (PROHIBITED.indexOf(candidate) >= 0);
		return candidate;
	}

	function genSimpleValue() {
		minNodes--;
		switch (randInt(0, 4)) {
			case 0:
				return randInt(-1000000, 1000000).toString();
			case 1:
				return (
					'"' +
					randArr(1, 5, i => String.fromCharCode(randInt(32, 127)))
						.filter(a => a !== '"' && a !== "\\")
						.join("") +
					'"'
				);
			case 2:
				minNodes++;
				return genIdentifier();
			case 3:
				return "null";
			case 4:
				return Math.random() > 0.5 ? "true" : "false";
			default:
				return "false";
		}
	}

	function genValue() {
		const iType = randInt(0, 5);
		if (iType <= 4) {
			return genSimpleValue();
		} else {
			// array
			const aElements = randArr(0, 5, i => genSimpleValue());
			minNodes -= 2;
			return "[" + aElements.join(", ") + "]";
		}
	}

	function genExpression() {
		const BIN_OPS = [
			"+",
			"-",
			"*",
			"/",
			"%",
			"|",
			"||",
			"&",
			"&&",
			"==",
			">=",
			"<=",
			"<",
			">",
			"<<",
			">>",
			"!=",
			"===",
			"!==",
		];
		const UN_OPS = ["!", "-", "~"];
		switch (randInt(0, 3)) {
			case 0:
				return genValue();
			case 1:
				minNodes--;
				return (
					genSimpleValue() +
					" " +
					randOf(BIN_OPS) +
					" " +
					genSimpleValue()
				);
			case 2:
				minNodes--;
				return randOf(UN_OPS) + genSimpleValue();
			case 3:
				minNodes -= 2;
				return (
					genIdentifier() +
					"(" +
					randArr(0, 5, i => genSimpleValue()).join(", ") +
					")"
				);
			default:
				return genValue();
		}
	}

	function genBlockStatement() {
		minNodes -= 2;
		return "{" + randArr(1, 5, i => genStatement()).join("\n") + "}";
	}

	function genStatement() {
		if (Math.random() < 0.66) {
			// Prefer shorter statements
			if (Math.random() < 0.5) {
				// Expression statements
				minNodes--;
				return genExpression() + ";";
			} else {
				// variable declaration
				minNodes--;
				return (
					"var " +
					randArr(
						1,
						3,
						i =>
							genIdentifier() +
							(Math.random() < 0.5 ? "" : " = " + genExpression())
					).join(", ") +
					";"
				);
			}
		} else {
			// the more complex statements
			switch (randInt(0, 3)) {
				case 0: {
					// if statement
					minNodes--;
					return "if (" + genExpression() + ")\n  " + genStatement();
				}
				case 1: {
					// while statement
					minNodes--;
					return (
						"while (" + genExpression() + ")\n  " + genStatement()
					);
				}
				case 2: {
					// for statement
					minNodes--;
					return (
						"for (;" + genExpression() + ";)\n  " + genStatement()
					);
				}
				case 3:
					return genBlockStatement();
				default:
					return genBlockStatement();
			}
		}
	}

	minNodes -= 2; // file and program
	let result = "";
	while (minNodes > 0) {
		result += genStatement() + "\n";
	}
	return result;
}
