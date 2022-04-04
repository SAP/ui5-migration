import * as VariableNameCreator from "../../src/util/VariableNameCreator";

const assert = require("assert");

describe("VariableNameCreator", () => {
	it("getUniqueVariableName special chars", () => {
		assert.strictEqual(
			VariableNameCreator.getUniqueVariableName([], "myVariable"),
			"myVariable",
			"not in use nor keyword"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueVariableName([], "5myVariable"),
			"o5myVariable",
			"starts with a number therefore prefix it"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueVariableName([], "_myVariable"),
			"_myVariable",
			"underscore is valid variable name start character"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueVariableName([], "my7%var"),
			"my7_var",
			"% is invalid character which gets replaced with underscore"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueVariableName([], "var"),
			"oVar",
			"var is a reserved keyword"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueVariableName([], "parseInt"),
			"oParseInt",
			"parseInt is a reserved builtin function"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueVariableName([], "sap"),
			"oSap",
			"sap is reserved for SAP"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueVariableName([], "navigator"),
			"oNavigator",
			"navigator is a reserved browser type"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueVariableName([], "jquery-ui"),
			"jqueryUi",
			"dashes in name should lead to camelize"
		);
	});

	it("getUniqueVariableName", () => {
		assert.strictEqual(
			VariableNameCreator.getUniqueVariableName(["yoo"], "yoo"),
			"oYoo",
			"yoo variable is already taken therefore add prefix"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueVariableName([], "Yoo"),
			"yoo",
			"variables start with lowercase char"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueVariableName(
				["arguments"],
				"arguments"
			),
			"oArguments",
			"arguments is already taken"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueVariableName(["asd"], "arguments"),
			"oArguments",
			"arguments is a js language reserved word"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueVariableName(["yoo"], "asd.yey.yoo"),
			"yeyYoo",
			"yoo is already excluded therefore add namespace"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueVariableName(
				["yeyYoo", "yoo"],
				"asd.yey.yoo"
			),
			"asdYeyYoo",
			"yoo and yeyYoo are already excluded therefore add namespace"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueVariableName(
				["asdYeyYoo", "yeyYoo", "yoo"],
				"asd.yey.yoo"
			),
			"oAsdYeyYoo",
			"yoo and yeyYoo and asdYeyYoo are already excluded therefore add namespace and add prefix"
		);
	});

	it("getUniqueParameterName", () => {
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(["yoo"], "yoo"),
			"oYoo",
			"yoo variable is already taken therefore add prefix"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName([], "yoo"),
			"yoo",
			"parameter name taken as is"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName([], "Yoo"),
			"Yoo",
			"parameter name taken as is"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				["arguments"],
				"arguments"
			),
			"oArguments",
			"arguments is already taken"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(["asd"], "arguments"),
			"oArguments",
			"arguments is a js language reserved word"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(["yoo"], "asd.yey.yoo"),
			"yeyYoo",
			"yoo is already excluded therefore add namespace"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				["yeyYoo", "yoo"],
				"asd.yey.yoo"
			),
			"asdYeyYoo",
			"yoo and yeyYoo are already excluded therefore add namespace"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				["asdYeyYoo", "yeyYoo", "yoo"],
				"asd.yey.yoo"
			),
			"oAsdYeyYoo",
			"yoo and yeyYoo and asdYeyYoo are already excluded therefore add namespace and add prefix"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName([], "Date"),
			"ODate",
			"Add O to the Date since it is a reserved native type"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(["ODate"], "Date"),
			"OODate",
			"Add O to the Date since it is a reserved native type and add additional O since is already in use"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				["oDate"],
				"sap.ui.model.type.Date"
			),
			"TypeDate",
			"Use namespace"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				[],
				"sap.ui.model.type.Date"
			),
			"TypeDate",
			"Use namespace"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				["TypeDate"],
				"sap.ui.model.type.Date"
			),
			"ModelTypeDate",
			"Use namespace to make it unique"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				["typeSwitch"],
				"sap.ui.model.type.switch"
			),
			"modelTypeSwitch",
			"Use namespace to make it unique (lowercase scenario)"
		);
		assert.strictEqual(
			VariableNameCreator.getUniqueParameterName(
				["typeDate", "date"],
				"sap.ui.model.type.date"
			),
			"modelTypeDate",
			"Use namespace to make it unique (lowercase scenario)"
		);
	});
});
