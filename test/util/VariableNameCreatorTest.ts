import * as VariableNameCreator from "../../src/util/VariableNameCreator";

const assert = require("assert");

describe("VariableNameCreator", function() {
	it("guessName", function() {
		assert.equal(VariableNameCreator.normalize("myVariable"), "myVariable");
		assert.equal(
			VariableNameCreator.normalize("1myVariable"), "o1myVariable");
		assert.equal(
			VariableNameCreator.normalize("_myVariable"), "_myVariable");
		assert.equal(VariableNameCreator.normalize("my7%var"), "my7_var");
		assert.equal(VariableNameCreator.normalize("var"), "oVar");
		assert.equal(VariableNameCreator.normalize("jquery-ui"), "jqueryUi");
	});

	it("getUniqueVariableName", function() {
		assert.equal(
			VariableNameCreator.getUniqueVariableName([ "yoo" ], "yoo"),
			"oYoo");
		assert.equal(
			VariableNameCreator.getUniqueVariableName([], "Yoo"), "yoo");
		assert.equal(
			VariableNameCreator.getUniqueVariableName(
				[ "arguments" ], "arguments"),
			"oArguments");
		assert.equal(
			VariableNameCreator.getUniqueVariableName([ "asd" ], "arguments"),
			"oArguments");
		assert.equal(
			VariableNameCreator.getUniqueVariableName([ "yoo" ], "asd.yey.yoo"),
			"yeyYoo");
		assert.equal(
			VariableNameCreator.getUniqueVariableName(
				[ "yeyYoo", "yoo" ], "asd.yey.yoo"),
			"asdYeyYoo");
		assert.equal(
			VariableNameCreator.getUniqueVariableName(
				[ "asdYeyYoo", "yeyYoo", "yoo" ], "asd.yey.yoo"),
			"oAsdYeyYoo");
	});
});