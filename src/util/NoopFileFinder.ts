import * as Mod from "../Migration";
import {FileInfo} from "./FileInfo";

export class NoopFileFinder implements Mod.FileFinder {
	findByPath(path: string): Promise<FileInfo | null> {
		return undefined;
	}
}
