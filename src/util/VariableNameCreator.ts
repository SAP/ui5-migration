const rAllowedStartCharacter = /^[A-Za-z_]/;
const rInvalidChars = /[^A-Za-z0-9_]/g;
const reservedKeywords = [
	"abstract",   "arguments",	"await",	"boolean", "break",
	"byte",		  "case",		  "catch",	"char",	"class",
	"const",	  "continue",	 "debugger", "default", "delete",
	"do",		  "double",		  "else",	 "enum",	"eval",
	"export",	 "extends",	  "false",	"final",   "finally",
	"float",	  "for",		  "function", "goto",	"if",
	"implements", "import",		  "",		  "in",		 "instanceof",
	"int",		  "interface",	"let",	  "long",	"native",
	"new",		  "null",		  "package",  "private", "protected",
	"public",	 "return",		  "short",	"static",  "super",
	"switch",	 "synchronized", "this",	 "throw",   "throws",
	"transient",  "true",		  "try",	  "typeof",  "var",
	"void",		  "volatile",	 "while",	"with",	"yield"
];
const sapReservedKeywords = [ "sap" ];


export function getUniqueVariableName(aUsedVariables: string[], sName: string) {
	let sResultName = "";
	sName.split(".").reverse().some((sNamePart) => {
		sResultName = decapitalize(sNamePart) + capitalize(sResultName);
		if (!aUsedVariables.includes(normalize(sResultName))) {
			sResultName = normalize(sResultName);
			return true;
		}
		return false;
	});

	while (aUsedVariables.includes(sResultName)) {
		sResultName = "o" + normalize(capitalize(sResultName));
	}

	return sResultName;
}

/**
 *
 * @param sVariableName the input variable name
 * @returns variable name which neither contain invalid characters nor is a
 * language keyword
 */
export function normalize(sVariableName: string): string {
	// variable name must start with a letter or an underscore
	// if not prepend "s" for string
	if (!rAllowedStartCharacter.test(sVariableName)) {
		sVariableName = "o" + capitalize(sVariableName);
	}

	// prettify variable name by removing dashes
	if (sVariableName.includes("-")) {
		const rCamelCase = /-(.)/ig;
		sVariableName =
			sVariableName.replace(rCamelCase, function(sMatch, sChar) {
				return sChar.toUpperCase();
			});
	}

	// replace invalid chars
	sVariableName = sVariableName.replace(rInvalidChars, "_");

	// ensure there is no keyword match
	while (reservedKeywords.includes(sVariableName) ||
		   sapReservedKeywords.includes(sVariableName)) {
		sVariableName = "o" + capitalize(sVariableName);
	}

	return sVariableName;
}

function capitalize(str: string): string {
	if (str.length < 1) {
		return "";
	}
	return str[0].toUpperCase() + str.substring(1);
}

function decapitalize(str: string): string {
	if (str.length < 1) {
		return "";
	}
	return str[0].toLowerCase() + str.substring(1);
}
