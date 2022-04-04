import {FolderFilter} from "../../../src/util/file/FolderFilter";

const assert = require("assert");

describe("FolderFilter", () => {
	it("should be possible to filter using FilderFilter", () => {
		const fsFilter = FolderFilter.create("myfolder");
		assert.equal(fsFilter.getDir(), "myfolder");
		assert.ok(fsFilter.match("myfolder"), "matches the file");
		assert.ok(!fsFilter.match("myfold2er"), "matches not the file");
	});
});
