import {FileFinder} from "../src/util/FileFinder";
import {FileInfo} from "../src/util/FileInfo";

const assert = require("assert");
const sinon = require("sinon");
const path = require("path");

const aFileArray = [
	path.join("test", "myfile2.js"),
	path.join("test", ".myfile12.js"),
];

const oBuilder = FileFinder.getBuilder();
oBuilder.getWd = function () {
	return "";
};

describe("FileFinder", () => {
	it("getAllFileInfos", () => {
		const oStub = sinon
			.stub(FileFinder.prototype, "getFiles")
			.returns(Promise.resolve(aFileArray));
		return new FileFinder(oBuilder).getFileInfoArray().then(aAllModules => {
			oStub.restore();
			assert.equal(aAllModules.length, 2, "should contain 2 entries");
			assert.deepEqual(
				aAllModules.map(o => {
					return o.sRelPath;
				}),
				aFileArray,
				"should contain 2 entries"
			);
		});
	});

	it("findByPath", () => {
		const oStubGetFiles = sinon
			.stub(FileFinder.prototype, "getFiles")
			.returns(Promise.resolve(aFileArray));
		const oStub = sinon
			.stub(FileInfo.prototype, "loadContent")
			.returns(Promise.resolve());
		return new FileFinder(oBuilder).findByPath("test/myfile2").then(o => {
			oStub.restore();
			oStubGetFiles.restore();
			assert.ok(o !== null, "object must be specified");
			if (o) {
				assert.equal(o.sRelPath, path.join("test", "myfile2.js"));
			}
		});
	});
});
