import {FileFilter} from "../../../src/util/file/FileFilter";

const assert = require("assert");

describe("FileFilter", () => {
	it("should be possible to filter using FileFilter", () => {
		const fsFilter = FileFilter.create("myfolder", "myfolder/myfile.js");
		assert.equal(fsFilter.getDir(), "myfolder");
		assert.ok(fsFilter.match("myfolder/myfile.js"), "matches the file");
		assert.ok(
			!fsFilter.match("myfolder/myfile2.js"),
			"matches not the file"
		);
	});
});
