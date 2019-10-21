import {FolderFilter} from "../../../src/util/file/FolderFilter";

const assert = require("assert");

describe("FolderFilter", function() {
	it("should be possible to filter using FilderFilter", function() {
		const fsFilter = FolderFilter.create("myfolder");
		assert.equal(fsFilter.getDir(), "myfolder");
		assert.ok(fsFilter.match("myfolder"), "matches the file");
		assert.ok(!fsFilter.match("myfold2er"), "matches not the file");
	});
});
