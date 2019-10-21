import ignore from "ignore";
import * as path from "path";

import * as StringWhitespaceUtils from "../whitespace/StringWhitespaceUtils";

import {FsFilter} from "./FsFilter";

const commentCharacter = "#";
/**
 * Matches files if they are specified in the ignore file
 * As specified in: https://git-scm.com/docs/gitignore
 */
export class IgnoreFileFilter implements FsFilter {
	private sFolder: string;
	private ignore;

	/**
	 * Creates IgnoreFileFilter from ignore strings.
	 * @param sFolder {string} folder name
	 * @param aIgnoreEntries {string[]} entries to be ignored, e.g. ['fileA.js',
	 * 'anotherFileB.js']
	 */
	constructor(sFolder: string, aIgnoreEntries: string[]) {
		this.sFolder = sFolder;
		this.ignore = ignore().add(aIgnoreEntries);
	}

	/**
	 * Matches the given file if ignore applies
	 * @param {string} sFile the file e.g. myFileA.js
	 * @returns matches if the given sFile would be ignored (according to the
	 * ignore file content)
	 */
	match(sFile: string): boolean {
		if (!sFile.startsWith(this.sFolder)) {
			return false;
		}
		sFile = path.relative(".", sFile);
		return sFile && this.ignore.ignores(sFile);
	}

	getDir(): string {
		return this.sFolder;
	}

	/**
	 * Creates IgnoreFileFilter from given file content.
	 * Ignores comments and splits lines
	 *
	 * @example ignore file content
	 * fileA.js
	 * # comment
	 * anotherFileB.js
	 *
	 * @param sFolder {string} folder name
	 * @param sIgnoreFileContent {string} content of ignore file
	 */
	static createFromContent(sFolder: string, sIgnoreFileContent: string) {
		const aLines = StringWhitespaceUtils.splitLines(sIgnoreFileContent);
		// ignore comments
		const aEntries = aLines.filter(sLine => {
			return (
				sLine &&
				sLine.trim() &&
				!sLine.trim().startsWith(commentCharacter)
			);
		});
		return IgnoreFileFilter.create(sFolder, aEntries);
	}

	/**
	 * Creates IgnoreFileFilter from ignore strings.
	 * @param sFolder {string} folder name
	 * @param aIgnoreEntries {string[]} entries to be ignored, e.g. ['fileA.js',
	 * 'anotherFileB.js']
	 */
	static create(sFolder: string, aIgnoreEntries: string[]) {
		return new IgnoreFileFilter(sFolder, aIgnoreEntries);
	}
}
