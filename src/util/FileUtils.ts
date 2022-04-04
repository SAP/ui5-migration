import * as fs from "fs";
import {Stats} from "fs";
import * as path from "path";
import * as util from "util";

export const fsStat = util.promisify(fs.stat);
export const fsReadDir = util.promisify(fs.readdir);
export const fsAccess = util.promisify(fs.access);
export const fsReadFile = util.promisify(fs.readFile);
export const fsWriteFile = util.promisify(fs.writeFile);
export const fsMkdir = util.promisify(fs.mkdir);

export async function getStats(sPath: string): Promise<Stats | undefined> {
	try {
		return await fsStat(sPath);
	} catch (e) {
		return undefined;
	}
}

export async function isDir(sPath: string): Promise<boolean> {
	const stat = await getStats(sPath);
	if (!stat) {
		return false;
	}
	return stat.isDirectory();
}

export async function isFile(sPath: string): Promise<boolean> {
	const stat = await getStats(sPath);
	if (!stat) {
		return false;
	}
	return stat.isFile();
}

export async function exists(sPath: string): Promise<boolean> {
	const stat = await getStats(sPath);
	if (!stat) {
		return false;
	}
	return stat.isDirectory() || stat.isFile();
}

/**
 * Extends path.normalize by always replacing / and \ with the platform specific
 * separator Also trailing separators are removed
 *
 * @export
 * @param {string} sPath
 * @param {string} sSep the path separator, if null the platform-default separator is used
 * @returns {string}
 */
export function normalize(sPath: string, sSep = ""): string {
	if (!sSep) {
		sSep = path.sep;
	}
	sPath = path.normalize(sPath).replace(/[/\\]+/g, sSep);
	if (sPath.lastIndexOf(sSep) === sPath.length - 1) {
		sPath = sPath.slice(0, -1);
	}
	return sPath;
}

export type FileMatcher = (sPath: string) => boolean;

const allFilesMatcher = function () {
	return true;
};

/**
 *
 * @param aFlatFiles array of currently parsed files
 * @param srcFile file or directory to parse
 * @param basePath base file or directory
 * @param fnMatcher optional file filter function
 */
async function parseDir(
	aFlatFiles: string[],
	srcFile: string,
	basePath: string,
	fnMatcher: FileMatcher = allFilesMatcher
): Promise<void> {
	const aEntries = await fsReadDir(srcFile);
	const aPromises = [];
	for (let sEntry of aEntries) {
		const sEntryPath = path.join(srcFile, sEntry);
		sEntry = path.join(basePath, sEntry);

		if (fnMatcher(sEntryPath)) {
			if (await isDir(sEntryPath)) {
				aPromises.push(
					parseDir(aFlatFiles, sEntryPath, sEntry, fnMatcher)
				);
			} else {
				aFlatFiles.push(sEntryPath);
			}
		}
	}
	return Promise.all(aPromises).then(() => {
		return undefined;
	});
}

/**
 * Searches all files recursively, returns their paths relative to srcFile
 *
 * @param srcFile path of file or root directory
 * @param fnMatcher optional file matcher function
 */
export async function getFilesRecursive(
	srcFile: string,
	fnMatcher?: FileMatcher
): Promise<string[]> {
	if (fnMatcher && !fnMatcher(srcFile)) {
		return Promise.resolve([]);
	}
	if (await isDir(srcFile)) {
		const aFiles: string[] = [];
		await parseDir(aFiles, srcFile, "", fnMatcher);
		return Promise.resolve(aFiles);
	} else {
		return Promise.resolve([srcFile]);
	}
}

/**
 * Creates a directory and all its parents
 *
 * @export
 * @param {any} dir
 */
export async function mkdirs(dir: string): Promise<void> {
	const aStack = [normalize(dir)];
	while (aStack.length > 0) {
		try {
			await fsMkdir(aStack[0]);
			aStack.shift();
		} catch (err) {
			if (err.code === "ENOENT") {
				const slashIdx = aStack[0].lastIndexOf(path.sep);
				if (slashIdx > 0) {
					const parentPath = aStack[0].substring(0, slashIdx);
					aStack.unshift(parentPath);
				} else {
					throw err;
				}
			} else if (err.code === "EEXIST") {
				aStack.shift();
			} else {
				throw err;
			}
		}
	}
}
