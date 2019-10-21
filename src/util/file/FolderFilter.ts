import {FsFilter} from "./FsFilter";

/**
 * Matches a folder
 */
export class FolderFilter implements FsFilter {
	private sFolder: string;
	constructor(sFolder: string) {
		this.sFolder = sFolder;
	}
	match(sFile: string): boolean {
		return sFile.startsWith(this.sFolder);
	}
	getDir(): string {
		return this.sFolder;
	}

	static create(sFolder: string) {
		return new FolderFilter(sFolder);
	}
}
