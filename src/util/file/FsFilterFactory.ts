import * as path from "path";

import * as FileUtils from "../FileUtils";

import {FileFilter} from "./FileFilter";
import {FolderFilter} from "./FolderFilter";
import {FsFilter} from "./FsFilter";
import {GlobFilter} from "./GlobFilter";
import {IgnoreFileFilter} from "./IgnoreFileFilter";

/**
 * Walks the path and returns the last valid folder
 * @param wdOrGlob
 */
async function getFolderFromGlob(wdOrGlob: string) {
	const aFolders = wdOrGlob.split("/");
	let sFolderName = aFolders[0];
	let bIsDirectory = await FileUtils.isDir(sFolderName);
	if (!bIsDirectory) {
		return undefined;
	}
	let sExistingFolder: string = sFolderName;
	for (let i = 1; i < aFolders.length; i++) {
		sExistingFolder = sFolderName;
		sFolderName = path.join(sFolderName, aFolders[i]);
		bIsDirectory = await FileUtils.isDir(sFolderName);
		if (!bIsDirectory) {
			return sExistingFolder;
		}
	}
	return sExistingFolder;
}

export async function createIgnoreFileFilter(
	sIgnoreFile: string
): Promise<FsFilter> {
	const oStats = await FileUtils.getStats(sIgnoreFile);
	if (oStats && oStats.isFile()) {
		const sFileContent = await FileUtils.fsReadFile(sIgnoreFile, "utf8");
		let sExistingFolder = ".";
		sExistingFolder = path.resolve(sExistingFolder);
		sExistingFolder = FileUtils.normalize(sExistingFolder);
		return IgnoreFileFilter.createFromContent(
			sExistingFolder,
			sFileContent
		);
	}
	throw Error("invalid ignore file specified " + sIgnoreFile);
}

/**
 *
 * @param {string} wdOrGlob
 * @returns Promise<FsFilter>
 */
export async function createFilter(wdOrGlob: string): Promise<FsFilter> {
	// TODO check relative/absolute paths
	const oStats = await FileUtils.getStats(wdOrGlob);
	if (!oStats) {
		// **/*.js
		// src/**/*.js
		let sExistingFolder = await getFolderFromGlob(wdOrGlob);
		if (!sExistingFolder) {
			sExistingFolder = ".";
		}
		sExistingFolder = path.resolve(sExistingFolder);
		sExistingFolder = FileUtils.normalize(sExistingFolder);
		return GlobFilter.create(sExistingFolder, wdOrGlob);
	} else if (oStats.isDirectory()) {
		// src
		wdOrGlob = path.resolve(wdOrGlob);
		wdOrGlob = FileUtils.normalize(wdOrGlob);
		return FolderFilter.create(wdOrGlob);
	} else if (oStats.isFile()) {
		// src/myFile.js
		wdOrGlob = path.resolve(wdOrGlob);
		wdOrGlob = FileUtils.normalize(wdOrGlob);
		return FileFilter.create(path.dirname(wdOrGlob), wdOrGlob);
	} else {
		return Promise.reject("invalid file/folder/glob specified " + wdOrGlob);
	}
}
