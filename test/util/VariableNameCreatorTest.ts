import * as VariableNameCreator from "../../src/util/VariableNameCreator";

const assert = require("assert");

describe("VariableNameCreator", function() {
	it("getUniqueVariableName special chars", function() {
		assert.equal(
			VariableNameCreator.getUniqueVariableName([], "myVariable"),
			"myVariable");
		assert.equal(
			VariableNameCreator.getUniqueVariableName([], "1myVariable"),
			"o1myVariable");
		assert.equal(
			VariableNameCreator.getUniqueVariableName([], "_myVariable"),
			"_myVariable");
		assert.equal(
			VariableNameCreator.getUniqueVariableName([], "my7%var"),
			"my7_var");
		assert.equal(
			VariableNameCreator.getUniqueVariableName([], "var"), "oVar");
		assert.equal(
			VariableNameCreator.getUniqueVariableName([], "jquery-ui"),
			"jqueryUi");
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

	it("getUniqueParameterName", function() {
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName([ "yoo" ], "yoo"),
			"oYoo");
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName([], "Yoo"), "Yoo");
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				[ "arguments" ], "arguments"),
			"oArguments");
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName([ "asd" ], "arguments"),
			"oArguments");
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				[ "yoo" ], "asd.yey.yoo"),
			"yeyYoo");
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				[ "yeyYoo", "yoo" ], "asd.yey.yoo"),
			"asdYeyYoo");
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				[ "asdYeyYoo", "yeyYoo", "yoo" ], "asd.yey.yoo"),
			"oAsdYeyYoo");
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName([], "Date"), "ODate",
			"Add O to the Date since it is a reserved native type");
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName([ "ODate" ], "Date"),
			"OODate");
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				[ "oDate" ], "sap.ui.model.type.Date"),
			"TypeDate");
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				[], "sap.ui.model.type.Date"),
			"TypeDate");
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				[ "TypeDate" ], "sap.ui.model.type.Date"),
			"ModelTypeDate");
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				[ "typeSwitch" ], "sap.ui.model.type.switch"),
			"modelTypeSwitch");
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				[ "typeDate", "date" ], "sap.ui.model.type.date"),
			"modelTypeDate");
	});
});
