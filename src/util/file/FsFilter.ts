/**
 * Represents a file system filter
 */
export interface FsFilter {
	match(sFile: string): boolean;
	getDir(): string;
}
