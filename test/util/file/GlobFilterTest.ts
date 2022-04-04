import {GlobFilter} from "../../../src/util/file/GlobFilter";

const assert = require("assert");

describe("GlobFilter", () => {
	it("should be possible to filter using GlobFilter", () => {
		const fsFilter = GlobFilter.create("myfolder", "myfolder/**/*.js");
		assert.equal(fsFilter.getDir(), "myfolder");
		assert.ok(fsFilter.match("myfolder/myfile.js"), "matches the file");
		assert.ok(
			fsFilter.match("myfolder/sub/myfile2.js"),
			"matches not the file"
		);
		assert.ok(
			!fsFilter.match("myfolder2/sub/myfile2.js"),
			"matches not the file"
		);
	});
});
