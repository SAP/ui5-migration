import {IgnoreFileFilter} from "../../../src/util/file/IgnoreFileFilter";

const assert = require("assert");

describe("IgnoreFileFilter", function() {
	it("should be possible to filter using IgnoreFileFilter", function() {
		const fsFilter = IgnoreFileFilter.create("myfolder", ["ax", "bx"]);
		assert.ok(fsFilter.match("myfolder/ax/myfile.js"), "matches the file");
		assert.ok(
			fsFilter.match("myfolder/bx/sub/myfile2.js"),
			"matches the file"
		);
		assert.ok(
			!fsFilter.match("myfolder2/sub/myfile2.js"),
			"matches not the file"
		);
	});

	it("createFromContent from string with \\n", function() {
		const fsFilter = IgnoreFileFilter.createFromContent(
			"myfolder",
			"ax\n# asd\nbx\n"
		);
		assert.ok(fsFilter.match("myfolder/ax/myfile.js"), "matches the file");
		assert.ok(
			fsFilter.match("myfolder/bx/sub/myfile2.js"),
			"matches the file"
		);
		assert.ok(
			!fsFilter.match("myfolder2/sub/myfile2.js"),
			"matches not the file"
		);
	});

	it("createFromContent from string with \\r\\n", function() {
		const fsFilter = IgnoreFileFilter.createFromContent(
			"myfolder",
			"ax\r\n# asd\r\nbx\r\n"
		);
		assert.ok(fsFilter.match("myfolder/ax/myfile.js"), "matches the file");
		assert.ok(
			fsFilter.match("myfolder/bx/sub/myfile2.js"),
			"matches the file"
		);
		assert.ok(
			!fsFilter.match("myfolder2/sub/myfile2.js"),
			"matches not the file"
		);
	});
});
