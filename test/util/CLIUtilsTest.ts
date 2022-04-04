import {parseNamespaces} from "../../src/util/CLIUtils";

const assert = require("assert");

describe("ConfigUtilsTest", () => {
	describe("matchesVersion: (happy path)", () => {
		it("Should succeed if valid version range was given", () => {
			assert.deepEqual(
				parseNamespaces(["a.b.c:src/x", "d.e.f:../"]),
				[
					{namespace: "a.b.c", filePath: "src/x"},
					{namespace: "d.e.f", filePath: "../"},
				],
				"Target version and given version range match"
			);
		});
	});
});
