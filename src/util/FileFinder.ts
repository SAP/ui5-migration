import * as path from "path";

import {NamespaceConfig} from "../index";
import * as Mod from "../Migration";

import {FsFilter} from "./file/FsFilter";
import {FileInfo} from "./FileInfo";
import * as FileUtils from "./FileUtils";

/**
 * Internal class used to build the FileFinder
 */
class FileFinderBuilder {
	private addFilesFilters: FsFilter[] = [];
	private aExcludeFilters: FsFilter[] = [];
	private aPostFilters: FsFilter[] = [];
	private aNamespaces: NamespaceConfig[] = [];

	namespaces(aNamespaces: NamespaceConfig[]) {
		// adjusts the path to make the relative NamespaceConfig path absolute
		const aNamespacesCopy = aNamespaces.map(oNamespace => {
			return Object.assign({}, oNamespace, {
				filePath:
					FileUtils.normalize(
						path.join(this.getWd(), oNamespace.filePath),
						"/"
					) + "/",
			});
		});
		this.aNamespaces = this.aNamespaces.concat(aNamespacesCopy);
		return this;
	}

	/**
	 * performs filters after all files are retrieved.
	 * Note: Resulting files must match all post filters
	 * @param {FsFilter[]} aPostFilters
	 * @returns {this}
	 */
	postFilters(aPostFilters: FsFilter[]) {
		this.aPostFilters = this.aPostFilters.concat(aPostFilters);
		return this;
	}

	/**
	 * Adds files from the filesystem using the given filters
	 * @param {FsFilter[]} addFilesFilters
	 * @returns {this}
	 */
	addFilesFromFilter(addFilesFilters: FsFilter[]) {
		this.addFilesFilters = this.addFilesFilters.concat(addFilesFilters);
		return this;
	}

	/**
	 * Excludes files from files retrieved via #addFilesFilters
	 * Note: Resulting files must not match any excludeFilesFromFilter
	 * @param {FsFilter[]} aExcludeFilters
	 * @returns {this}
	 */
	excludeFilesFromFilter(aExcludeFilters: FsFilter[]) {
		this.aExcludeFilters = this.aExcludeFilters.concat(aExcludeFilters);
		return this;
	}

	/**
	 * Returns namespaces
	 * @returns {NamespaceConfig[]}
	 */
	getNameSpaces() {
		return this.aNamespaces;
	}

	/**
	 * Returns exclude filters
	 * @returns {FsFilter[]}
	 */
	getExcludeFilters() {
		return this.aExcludeFilters;
	}

	/**
	 * Returns post filter
	 * @returns {FsFilter[]}
	 */
	getPostFilters() {
		return this.aPostFilters;
	}

	/**
	 * Returns add files filters
	 * @returns {FsFilter[]}
	 */
	getAddFilters() {
		return this.addFilesFilters;
	}

	/**
	 * Returns working directory
	 * @returns {string}
	 */
	getWd() {
		return process.cwd();
	}

	/**
	 * Creates a new file finder instance
	 * @returns {FileFinder}
	 */
	build(): FileFinder {
		return new FileFinder(this);
	}
}

/**
 * Searches files
 * Uses builder pattern
 *
 *
 * FileFinder.getBuilder().addFilesFromFilter(..).excludeFilesFromFilter(..).build()
 *
 * @class FileFinder
 * @implements {Mod.FileFinder}
 */
export class FileFinder implements Mod.FileFinder {
	private builder: FileFinderBuilder;
	private mModules: {[localPath: string]: FileInfo};

	constructor(builder: FileFinderBuilder) {
		this.builder = builder;
		this.mModules = {};
	}

	/**
	 * Retrieves the files using the builder options
	 * @returns {Promise<string[]>}
	 */
	async getFiles(): Promise<string[]> {
		// gather working directories

		const aFilePromises: Array<Promise<string[]>> = [];
		this.builder.getAddFilters().forEach(oIncludeFilter => {
			const wd = oIncludeFilter.getDir();
			const pFilePromise = FileUtils.getFilesRecursive(wd, sFile => {
				// there should not be one exclude filter match
				return !this.builder
					.getExcludeFilters()
					.some(oExcludeFilter => {
						return oExcludeFilter.match(sFile);
					});
			});
			aFilePromises.push(
				pFilePromise.then(aFiles => {
					const fnReducer = function (
						aPrevious: string[],
						sFile: string
					) {
						if (oIncludeFilter.match(sFile)) {
							aPrevious.push(sFile);
						}
						return aPrevious;
					};
					return aFiles.reduce(fnReducer, []);
				})
			);
		});
		return Promise.all(aFilePromises).then(aResults => {
			let aResultFiles: string[] = [];
			aResults.forEach(aResult => {
				aResultFiles = aResultFiles.concat(
					aResult.filter(sResult => {
						return this.builder
							.getPostFilters()
							.every(oPostFilter => {
								return oPostFilter.match(sResult);
							});
					})
				);
			});
			return aResultFiles;
		});
	}

	private static getModuleName(sFile): string {
		return FileUtils.normalize(sFile, "/").replace(/\.js$/, "");
	}

	/**
	 * Retrieves namespace for a given file
	 * @param {string} sFile src/a/b.js
	 * @param {NamespaceConfig[]} nameSpaces {namespace:"x.y", filePath:"src"}
	 * @return {string} "x.y.a.b"
	 */
	static getNamespace(sFile: string, nameSpaces: NamespaceConfig[]): string {
		// clone namespace config
		const normalizedNameSpaces = nameSpaces.map(oNameSpace => {
			const newNameSpace = Object.assign({}, oNameSpace);
			if (!newNameSpace.filePath.endsWith("/")) {
				newNameSpace.filePath = newNameSpace.filePath + "/";
			}
			return newNameSpace;
		});

		const aFiltered = normalizedNameSpaces.filter(oNameSpace => {
			return sFile.startsWith(oNameSpace.filePath);
		});
		if (aFiltered.length === 0) {
			return undefined;
		}

		const best = aFiltered.reduce((a, b) => {
			return a.filePath.length > b.filePath.length ? a : b;
		});
		if (best) {
			return (
				best.namespace +
				"." +
				FileUtils.normalize(
					sFile.substring(best.filePath.length),
					"."
				).replace(/\.js$/, "")
			);
		}
		return undefined;
	}

	private async convertToFileInfoMapping() {
		// cache
		if (Object.keys(this.mModules).length > 0) {
			return Promise.resolve(this.mModules);
		}
		const files = await this.getFiles();
		files.forEach(sFile => {
			const sModuleName = FileFinder.getModuleName(sFile);
			const sNamespace = FileFinder.getNamespace(
				sModuleName,
				this.builder.getNameSpaces()
			);

			this.mModules[sModuleName] = new FileInfo(
				this.builder.getWd(),
				path.relative(this.builder.getWd(), sFile),
				sModuleName,
				sNamespace
			);
		});
		return Promise.resolve(this.mModules);
	}

	async getFileInfoArray(): Promise<FileInfo[]> {
		const mModules = await this.convertToFileInfoMapping();
		return Object.keys(mModules).map(sKey => {
			return mModules[sKey];
		});
	}

	async findByPath(sPath: string): Promise<FileInfo | null> {
		const sNormPath = FileFinder.getModuleName(sPath);
		const mModules = await this.convertToFileInfoMapping();
		if (sNormPath in mModules) {
			const oModule = mModules[sNormPath];
			await oModule.loadContent();
			return oModule;
		} else {
			// check if file exists although not part of the input files
			const bExists = await FileUtils.isFile(sPath);
			if (bExists) {
				return new FileInfo(
					this.builder.getWd(),
					path.relative(this.builder.getWd(), sPath),
					FileFinder.getModuleName(sPath),
					FileFinder.getNamespace(sPath, this.builder.getNameSpaces())
				);
			}
			return undefined;
		}
	}

	static getBuilder() {
		return new FileFinderBuilder();
	}
}
