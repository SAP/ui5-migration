import * as minimatch from "minimatch";
import * as path from "path";

import {FsFilter} from "./FsFilter";

/**
 * Matches a folder
 */
export class GlobFilter implements FsFilter {
	private sFolder: string;
	private sGlob: string;
	private oMinimatch: minimatch.IMinimatch;
	constructor(sFolder: string, sGlob: string) {
		this.sFolder = sFolder;
		this.sGlob = sGlob;
		this.oMinimatch = new minimatch.Minimatch(this.sGlob);
	}
	match(sFile: string): boolean {
		if (!sFile.startsWith(this.sFolder)) {
			return false;
		}
		sFile = path.relative(".", sFile);
		return this.oMinimatch.match(sFile);
	}
	getDir(): string {
		return this.sFolder;
	}

	static create(sFolder: string, sGlob: string) {
		return new GlobFilter(sFolder, sGlob);
	}
}
