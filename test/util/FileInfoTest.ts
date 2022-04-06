import {FileInfo} from "../../src/util/FileInfo";
import * as FileUtils from "../../src/util/FileUtils";
import * as ESTree from "estree";
import * as recast from "recast";

const assert = require("assert");
const sinon = require("sinon");

const builders = recast.types.builders;

describe("FileInfo", () => {
	describe("should call saveContent", () => {
		it("Should keep the whitespace characters at the end of the file", async () => {
			const content = "var x = 5;\n\n";

			sinon
				.stub(FileUtils, "fsReadFile")
				.resolves(Promise.resolve(content));

			sinon.stub(FileUtils, "fsWriteFile").resolves(Promise.resolve());

			sinon.stub(FileUtils, "mkdirs").resolves(Promise.resolve());

			const fileInfo = new FileInfo("", "", "", "");

			await fileInfo.loadContent();

			const oAST = fileInfo.getAST();

			assert.ok(oAST, "ast is present");

			// AST modification
			const varDec = (oAST as ESTree.Program)
				.body[0] as ESTree.VariableDeclaration;
			varDec.declarations[0].init = builders.stringLiteral("7");

			const sResult = await fileInfo.saveContent("");

			assert.equal(sResult, 'var x = "7";\n\n');
		});
	});
});
