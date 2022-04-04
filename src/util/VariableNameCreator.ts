import * as globals from "globals";

const rAllowedStartCharacter = /^[A-Za-z_]/;
const rInvalidChars = /[^A-Za-z0-9_]/g;
const reservedJSLanguageKeywords = [
	"abstract",
	"arguments",
	"await",
	"boolean",
	"break",
	"byte",
	"case",
	"catch",
	"char",
	"class",
	"const",
	"continue",
	"debugger",
	"default",
	"delete",
	"do",
	"double",
	"else",
	"enum",
	"eval",
	"export",
	"extends",
	"false",
	"final",
	"finally",
	"float",
	"for",
	"function",
	"goto",
	"if",
	"implements",
	"import",
	"in",
	"instanceof",
	"int",
	"interface",
	"let",
	"long",
	"native",
	"new",
	"null",
	"package",
	"private",
	"protected",
	"public",
	"return",
	"short",
	"static",
	"super",
	"switch",
	"synchronized",
	"this",
	"throw",
	"throws",
	"transient",
	"true",
	"try",
	"typeof",
	"var",
	"void",
	"volatile",
	"while",
	"with",
	"yield",
];
const sapReservedKeywords = ["sap"];

const reservedBrowserTypes = Object.keys(globals.browser);
const reservedNativeTypes = Object.keys(globals.builtin);

export function getUniqueParameterName(
	aUsedVariables: string[],
	sName: string
) {
	return getUniqueName(aUsedVariables, sName);
}

const getUniqueNameDecapitalized = function (
	aUsedVariables: string[],
	sName: string
) {
	return getUniqueName(aUsedVariables, sName, true);
};

const isLowerCase = function (sChar) {
	return sChar === sChar.toLowerCase();
};

/**
 *
 * @param aUsedVariables
 * @param sName
 */
const isUnique = function (aUsedVariables: string[], sName: string): boolean {
	return !aUsedVariables.includes(sName) && !isReservedWord(sName);
};

/**
 *
 * @param aUsedVariables
 * @param sName, e.g. Date
 * @returns whether or not the name is a valid candidate
 */
const isValidIdentifierName = function (
	aUsedVariables: string[],
	sName: string
) {
	return (
		rAllowedStartCharacter.test(sName) && isUnique(aUsedVariables, sName)
	);
};

const replaceInvalidCharacters = function (sName) {
	sName = camelize(sName);
	return sName.replace(rInvalidChars, "_");
};

/**
 *
 * @param aUsedVariables variable names which are already in use and should not
 * be taken
 * @param sName module name e.g. sap.ui.model.type.Date
 * @param createLowercaseVariableName whether or not to enforce variable name
 * starting with a lowercase character
 * @returns unique variable name which is neither reserved nor taken
 */
const getUniqueName = function (
	aUsedVariables: string[],
	sName: string,
	createLowercaseVariableName?: boolean
): string {
	// split the name and reverse, e.g. ["Date", "type", "model", "ui", "sap"]
	const aNameSplitted = sName.split(".").reverse();
	let sResultName = "";
	const bCreateLowercaseVariableName =
		createLowercaseVariableName || isLowerCase(aNameSplitted[0].charAt(0));

	// make use of the whole namespace before applying prefix
	for (let i = 0; i < aNameSplitted.length; i++) {
		// concatenate name
		sResultName =
			replaceInvalidCharacters(aNameSplitted[i]) +
			capitalize(sResultName);

		const candidate = bCreateLowercaseVariableName
			? decapitalize(sResultName)
			: capitalize(sResultName);

		// check if candidate is valid
		if (isValidIdentifierName(aUsedVariables, candidate)) {
			return candidate;
		}
	}

	// add prefix to make it unique
	const prefixCharacter = bCreateLowercaseVariableName ? "o" : "O";
	while (!isValidIdentifierName(aUsedVariables, sResultName)) {
		sResultName = prefixCharacter + capitalize(sResultName);
	}

	return sResultName;
};

/**
 * In case the candidate is already taken, the variable name gets prefixed with
 * 'o' until it is unique
 *
 * @param aUsedVariables Existing variable names which are already in use, e.g.
 * Component
 * @param sName Name of the candidate, e.g. sap.ui.core.Component
 * @returns A unique variable name starting with a lowercase character
 */
export function getUniqueVariableName(aUsedVariables: string[], sName: string) {
	return getUniqueNameDecapitalized(aUsedVariables, sName);
}

const isReservedWord = function (sVariableName: string) {
	return (
		reservedJSLanguageKeywords.includes(sVariableName) ||
		sapReservedKeywords.includes(sVariableName) ||
		reservedBrowserTypes.includes(sVariableName) ||
		reservedNativeTypes.includes(sVariableName)
	);
};

/**
 * @param str input string, e.g. "asd"
 * @returns {string} first character being upper case, e.g. "Asd"
 */
const capitalize = function (str: string): string {
	if (str.length < 1) {
		return "";
	}
	return str[0].toUpperCase() + str.substring(1);
};

/**
 * @param str input string, e.g. "asd-fgh"
 * @returns {string} every character after the dash is uppercase and dash gets removed, e.g. "asdFgh"
 */
const camelize = function (str: string): string {
	if (str.includes("-")) {
		const rCamelCase = /-(.)/gi;
		return str.replace(rCamelCase, (sMatch, sChar) => {
			return sChar.toUpperCase();
		});
	}
	return str;
};

/**
 * @param str input string, e.g. "ASD"
 * @returns {string} first character being lower case, e.g. "aSD"
 */
const decapitalize = function (str: string): string {
	if (str.length < 1) {
		return "";
	}
	return str[0].toLowerCase() + str.substring(1);
};
