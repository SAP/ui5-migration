import {Range} from "../../src/util/Range";

import assert = require("assert");

describe("Range", () => {
	it("isOverlappedBy sad path", () => {
		const range1 = Range.from(100, 300);
		const range2 = Range.from(50, 90);

		assert.ok(
			!range1.isOverlappedBy(range2),
			"range 1 is not overlapped by range 2"
		);
		assert.ok(
			!range2.isOverlappedBy(range1),
			"range 2 is not overlapped by range 1"
		);
	});

	it("isOverlappedBy happy path full containment", () => {
		const range1 = Range.from(100, 300);
		const range2 = Range.from(150, 250);

		assert.ok(
			range1.isOverlappedBy(range2),
			"range 1 is overlapped by range 2"
		);
		assert.ok(
			range2.isOverlappedBy(range1),
			"range 2 is overlapped by range 1"
		);
	});

	it("isOverlappedBy happy path overlap", () => {
		const range1 = Range.from(100, 300);
		const range2 = Range.from(50, 250);

		assert.ok(
			range1.isOverlappedBy(range2),
			"range 1 is overlapped by range 2"
		);
		assert.ok(
			range2.isOverlappedBy(range1),
			"range 2 is overlapped by range 1"
		);
	});
});
