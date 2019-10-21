import {NamespaceConfig} from "../index";

/**
 * Parse given namespace object and retrieves parsed namespace config
 * @param {string[]} namespaceInput, e.g. ["a.b.c:src", "x.y.z:./"]
 * @returns {NamespaceConfig[]} e.g. [
	{ namespace : "a.b.c", filePath : "src" },
	{ namespace : "d.e.f", filePath : "./" }
 ]
 */
export function parseNamespaces(namespaceInput: string[]): NamespaceConfig[] {
	return namespaceInput.map(sEntry => {
		const aParts = sEntry.split(":");
		return {namespace: aParts[0], filePath: aParts[1]};
	});
}
