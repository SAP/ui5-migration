import {FileFinder} from "../../src/util/FileFinder";

const assert = require("assert");
const sinon = require("sinon");
const path = require("path");

describe("FileFinder", () => {
	describe("should build FileFinder with namespaces)", () => {
		it("Should use the correct namespaces", async () => {
			const aNamespaces = [
				{namespace: "a.b.c", filePath: "src/x"},
				{namespace: "d.e.f", filePath: "src"},
			];
			const builder = FileFinder.getBuilder();
			const oStubWd = sinon.stub(builder, "getWd").returns("");
			const ff: FileFinder = builder.namespaces(aNamespaces).build();
			const oStub = sinon
				.stub(ff, "getFiles")
				.resolves([
					"src/x/asd/ff.js",
					"src/ff.js",
					"src/xlongerthanfirst/a.js",
					"x/asd/ff2.js",
				]);

			const aFileInfos = await ff.getFileInfoArray();
			assert.deepEqual(
				aFileInfos.map(oFile => {
					return {
						filePath: oFile.getPath(),
						namespace: oFile.getNamespace(),
					};
				}),
				[
					{
						filePath: path.normalize("src/x/asd/ff.js"),
						namespace: "a.b.c.asd.ff",
					},
					{
						filePath: path.normalize("src/ff.js"),
						namespace: "d.e.f.ff",
					},
					{
						filePath: path.normalize("src/xlongerthanfirst/a.js"),
						namespace: "d.e.f.xlongerthanfirst.a",
					},
					{
						filePath: path.normalize("x/asd/ff2.js"),
						namespace: undefined,
					},
				],
				"Target version and given version range match"
			);
			oStub.restore();
			oStubWd.restore();
		});
	});
});
