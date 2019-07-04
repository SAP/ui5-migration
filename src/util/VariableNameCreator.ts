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

const reservedBrowserTypes = [
	"Element", "History", "Node", "Option", "Performance", "Plugin", "Range",
	"Request", "Response", "Storage", "StyleSheet", "Text", "Touch",
	"WebSocket", "Worker"
];
const reservedNativeTypes = [
	"Array",
	"ArrayBuffer",
	"Atomics",
	"BigInt",
	"BigInt64Array",
	"BigUint64Array",
	"Boolean",
	"DataView",
	"Date",
	"Error",
	"EvalError",
	"Float32Array",
	"Float64Array",
	"Function",
	"Generator",
	"GeneratorFunction",
	"Infinity",
	"Int16Array",
	"Int32Array",
	"Int8Array",
	"InternalError",
	"Intl",
	"Intl.Collator",
	"Intl.DateTimeFormat",
	"Intl.Locale",
	"Intl.NumberFormat",
	"Intl.PluralRules",
	"Intl.RelativeTimeFormat",
	"JSON",
	"Map",
	"Math",
	"NaN",
	"Number",
	"Object",
	"Promise",
	"Proxy",
	"RangeError",
	"ReferenceError",
	"Reflect",
	"RegExp",
	"Set",
	"SharedArrayBuffer",
	"String",
	"Symbol",
	"SyntaxError",
	"TypeError",
	"TypedArray",
	"URIError",
	"Uint16Array",
	"Uint32Array",
	"Uint8Array",
	"Uint8ClampedArray",
	"WeakMap",
	"WeakSet",
	"WebAssembly"
];
const reservedNativeFunctions = [
	"decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent",
	"globalThis", "isFinite", "isNaN", "parseFloat", "parseInt"
];

export function getUniqueParameterName(
	aUsedVariables: string[], sName: string) {
	return getUniqueName(aUsedVariables, sName);
}

const getUniqueNameDecapitalized = function(
	aUsedVariables: string[], sName: string) {
	return getUniqueName(aUsedVariables, sName, true);
};

const isLowerCase = function(sChar) {
	return sChar === sChar.toLowerCase();
};

/**
 *
 * @param aUsedVariables
 * @param sName
 */
const isUnique = function(aUsedVariables: string[], sName: string): boolean {
	return !aUsedVariables.includes(sName) && !isReservedWord(sName);
};

const isValidIdentifierName = function(
	aUsedVariables: string[], sName: string) {
	return rAllowedStartCharacter.test(sName) &&
		isUnique(aUsedVariables, sName);
};

const replaceInvalidCharacters = function(sName) {
	sName = camelize(sName);
	return sName.replace(rInvalidChars, "_");
};


const getUniqueName = function(
	aUsedVariables: string[], sName: string,
	createLowercaseVariableName?: boolean) {
	// for param names
	const aNameSplitted = sName.split(".").reverse();
	let sResultName = "";
	const bCreateLowercaseVariableName =
		createLowercaseVariableName || isLowerCase(aNameSplitted[0].charAt(0));
	for (let i = 0; i < aNameSplitted.length; i++) {
		sResultName = replaceInvalidCharacters(aNameSplitted[i]) +
			capitalize(sResultName);

		const candidate = bCreateLowercaseVariableName ?
			decapitalize(sResultName) :
			capitalize(sResultName);
		if (isValidIdentifierName(aUsedVariables, candidate)) {
			return candidate;
		}
	}

	// add O's
	// ooooooDate
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

const isReservedWord = function(sVariableName: string) {
	return reservedKeywords.includes(sVariableName) ||
		sapReservedKeywords.includes(sVariableName) ||
		reservedBrowserTypes.includes(sVariableName) ||
		reservedNativeFunctions.includes(sVariableName) ||
		reservedNativeTypes.includes(sVariableName);
};

/**
 * @param str input string, e.g. "asd"
 * @returns {string} first character being upper case, e.g. "Asd"
 */
const capitalize = function(str: string): string {
	if (str.length < 1) {
		return "";
	}
	return str[0].toUpperCase() + str.substring(1);
};

/**
 * @param str input string, e.g. "asd-fgh"
 * @returns {string} every character after the dash is uppercase and dash gets removed, e.g. "asdFgh"
 */
const camelize = function(str: string): string {
	if (str.includes("-")) {
		const rCamelCase = /-(.)/ig;
		return str.replace(rCamelCase, function(sMatch, sChar) {
			return sChar.toUpperCase();
		});
	}
	return str;
};

/**
 * @param str input string, e.g. "ASD"
 * @returns {string} first character being lower case, e.g. "aSD"
 */
const decapitalize = function(str: string): string {
	if (str.length < 1) {
		return "";
	}
	return str[0].toLowerCase() + str.substring(1);
};
