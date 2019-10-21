import {FsFilter} from "./FsFilter";

/**
 * Matches a file
 */
export class FileFilter implements FsFilter {
	private sFolder: string;
	private sFile: string;
	constructor(sFolder: string, sFile: string) {
		this.sFolder = sFolder;
		this.sFile = sFile;
	}
	match(sFile: string): boolean {
		return sFile === this.sFile;
	}
	getDir(): string {
		return this.sFolder;
	}

	static create(sFolder: string, sFile: string) {
		return new FileFilter(sFolder, sFile);
	}
}
