/**
 *
 * @param fqmn1 fully qualified module name, e.g. a.b.c
 * @param fqmn2 fully qualified module name, e.g. a.b.c
 * @returns {boolean} whether or not the 2 fully qualified module names are equal (ignores self/window prefixes)
 */
export function compare(fqmn1: string, fqmn2: string): boolean {
	return normalize(fqmn1) === normalize(fqmn2);
}

const aGlobalReferences = ["self", "window"];

/**
 *
 * @param str
 * @returns {string} normalized string without prefix (global reference, e.g. window, self)
 */
function normalize(str: string): string {
	let sStartsWithString = startsWith(str);
	while (sStartsWithString) {
		str = str.substring((sStartsWithString + ".").length);
		sStartsWithString = startsWith(str);
	}
	return str;
}

function startsWith(str: string): string {
	const iIndex = aGlobalReferences.findIndex(sGlobalReference => {
		return str.startsWith(sGlobalReference);
	});
	if (iIndex >= 0) {
		return aGlobalReferences[iIndex];
	}
	return "";
}
