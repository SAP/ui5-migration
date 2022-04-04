import * as ModuleNameComparator from "../../src/util/ModuleNameComparator";

const assert = require("assert");

describe("ConfigUtilsTest", () => {
	it("Should succeed if valid version range was given", () => {
		assert.ok(
			ModuleNameComparator.compare("window.a", "a"),
			"window prefix is ignored"
		);
		assert.ok(
			ModuleNameComparator.compare("self.a", "a"),
			"self prefix is ignored"
		);
		assert.ok(
			ModuleNameComparator.compare("window.self.a", "a"),
			"window.self prefix is ignored"
		);
	});
});
