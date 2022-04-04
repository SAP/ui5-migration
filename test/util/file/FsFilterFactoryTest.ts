import * as FsFilterFactory from "../../../src/util/file/FsFilterFactory";
import * as FileUtils from "../../../src/util/FileUtils";

const assert = require("assert");
const path = require("path");

const sinon = require("sinon");

describe("FsFilterFactory", () => {
	let oStub: {restore: Function};
	beforeEach(() => {
		oStub = sinon.stub(FileUtils, "normalize").returnsArg(0);
	});

	afterEach(() => {
		if (oStub) {
			oStub.restore();
		}
	});

	function resolve(sPath: string) {
		return path.resolve(sPath);
	}

	it("should be possible to create filters using FsFilterFactory: invalid", () => {
		const oStub = sinon.stub(FileUtils, "getStats").returns(
			Promise.resolve({
				isFile() {
					return false;
				},
				isDirectory() {
					return false;
				},
			})
		);

		return FsFilterFactory.createFilter("myfolder/myfile.js").then(
			fsFilter => {
				oStub.restore();
				assert.fail("invalid, neither file nor function, nor glob");
			},
			e => {
				oStub.restore();
				assert.ok(e);
			}
		);
	});

	it("should be possible to create filters using FsFilterFactory: FileFilter", () => {
		const oStub = sinon.stub(FileUtils, "getStats").returns(
			Promise.resolve({
				isFile() {
					return true;
				},
				isDirectory() {
					return false;
				},
			})
		);

		return FsFilterFactory.createFilter("myfolder/myfile.js").then(
			fsFilter => {
				oStub.restore();
				assert.equal(fsFilter.getDir(), resolve("myfolder"));
				assert.ok(
					fsFilter.match(resolve("myfolder/myfile.js")),
					"matches the file"
				);
				assert.ok(
					!fsFilter.match(resolve("myfolder/myfile2.js")),
					"matches not the file"
				);
			}
		);
	});

	it("should be possible to create filters using FsFilterFactory: FolderFilter", () => {
		const oStub = sinon.stub(FileUtils, "getStats").returns(
			Promise.resolve({
				isFile() {
					return false;
				},
				isDirectory() {
					return true;
				},
			})
		);

		return FsFilterFactory.createFilter("myfolder").then(fsFilter => {
			oStub.restore();
			assert.equal(fsFilter.getDir(), resolve("myfolder"));
			assert.ok(fsFilter.match(resolve("myfolder")), "matches the file");
			assert.ok(
				!fsFilter.match(resolve("myfold2er")),
				"matches not the file"
			);
		});
	});

	it("should be possible to create filters using FsFilterFactory: GlobFilter top dir", () => {
		const oStub = sinon
			.stub(FileUtils, "getStats")
			.returns(Promise.resolve(undefined));
		const oStubIsDir = sinon.stub(FileUtils, "isDir");
		oStubIsDir.returns(Promise.resolve(false));
		return FsFilterFactory.createFilter("**/*Util.js").then(fsFilter => {
			oStub.restore();
			oStubIsDir.restore();
			assert.equal(fsFilter.getDir(), resolve("."));
			assert.ok(
				fsFilter.match(resolve("srcd/util/MyUtil.js")),
				"matches the file"
			);
			assert.ok(
				fsFilter.match(resolve("src/util/MyUtil.js")),
				"matches the file"
			);
		});
	});

	it("should be possible to create filters using FsFilterFactory: GlobFilter one level", () => {
		const oStub = sinon
			.stub(FileUtils, "getStats")
			.returns(Promise.resolve(undefined));
		const oStubIsDir = sinon.stub(FileUtils, "isDir");
		oStubIsDir.withArgs("srcd").returns(Promise.resolve(true));
		oStubIsDir.returns(Promise.resolve(false));
		return FsFilterFactory.createFilter("srcd/**/*Util.js").then(
			fsFilter => {
				oStub.restore();
				oStubIsDir.restore();
				assert.equal(fsFilter.getDir(), resolve("srcd"));
				assert.ok(
					fsFilter.match(resolve("srcd/util/MyUtil.js")),
					"matches the file"
				);
				assert.ok(
					!fsFilter.match(resolve("src/util/MyUtil.js")),
					"matches not the file"
				);
			}
		);
	});

	it("should be possible to create filters using FsFilterFactory: GlobFilter deep", () => {
		const oStub = sinon
			.stub(FileUtils, "getStats")
			.returns(Promise.resolve(undefined));
		const oStubIsDir = sinon.stub(FileUtils, "isDir");
		oStubIsDir.withArgs("srcd").returns(Promise.resolve(true));
		oStubIsDir
			.withArgs(path.normalize("srcd/util"))
			.returns(Promise.resolve(true));
		oStubIsDir.returns(Promise.resolve(false));
		return FsFilterFactory.createFilter("srcd/util/**/*Util.js").then(
			fsFilter => {
				oStub.restore();
				oStubIsDir.restore();
				assert.equal(fsFilter.getDir(), resolve("srcd/util"));
				assert.ok(
					fsFilter.match(resolve("srcd/util/MyUtil.js")),
					"matches the file"
				);
				assert.ok(
					!fsFilter.match(resolve("src/util/MyUtil.js")),
					"matches not the file"
				);
			}
		);
	});
});
