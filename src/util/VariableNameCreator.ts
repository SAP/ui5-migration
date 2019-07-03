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
	"WebAssembly",
	"decodeURI",
	"decodeURIComponent",
	"encodeURI",
	"encodeURIComponent",
	"eval",
	"globalThis",
	"isFinite",
	"isNaN",
	"null",
	"parseFloat",
	"parseInt"
];

/**
 * In case the candidate is already taken, the variable name gets prefixed with
 * 'o' until it is unique
 *
 * @param aUsedVariables Existing variable names which are already in use, e.g.
 * Component
 * @param sName Name of the candidate, e.g. sap.ui.core.Component
 * @returns A unique variable name
 */
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
		   sapReservedKeywords.includes(sVariableName) ||
		   reservedNativeTypes.includes(sVariableName)) {
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
