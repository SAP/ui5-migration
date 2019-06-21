sap.ui.define([],
	function() {
		"use strict";

		// different usage types - jQuery.sap.getModulePath - Literal
		var test = sap.ui.require.toUrl("test/123") + ".json";
		if (sap.ui.require.toUrl("test/123") + ".json") {
			var test = "Test." + (sap.ui.require.toUrl("test/123") + ".json");
			oParam(sap.ui.require.toUrl("test/mypath") + ".txt");
		}

		// jQuery.sap.getModulePath - Literal - different parameter combinations
		sap.ui.require.toUrl("my/module/mapping");
		sap.ui.require.toUrl("my/module/mapping");
		sap.ui.require.toUrl("my/module/mapping");
		sap.ui.require.toUrl("my/module/mapping");
		sap.ui.require.toUrl("my/module/mapping");
		sap.ui.require.toUrl("my/module/mapping");
		sap.ui.require.toUrl("my/module/mapping/");
		sap.ui.require.toUrl("my/module/mapping/");
		sap.ui.require.toUrl("my/module/mapping/");

		// jQuery.sap.getModulePath - Non-Literal
		sap.ui.require.toUrl((test).replace(/\./g, "/"));
		sap.ui.require.toUrl((test).replace(/\./g, "/")) + ".json";
		sap.ui.require.toUrl("my/path") + test;
		sap.ui.require.toUrl((test + "").replace(/\./g, "/"));
		sap.ui.require.toUrl(((function() {})()).replace(/\./g, "/"));
		sap.ui.require.toUrl((test()).replace(/\./g, "/")) + (function() {})();

		// jQuery.sap.getResourcePath - Literal - different usages
		var test = sap.ui.require.toUrl("test/123");
		if (sap.ui.require.toUrl("test/123")) {
			var test = "Test." + sap.ui.require.toUrl("test/123");
			oParam(sap.ui.require.toUrl("test/mypath"));
		}

		// different parameter combinations - getResourcePath - Literal
		sap.ui.require.toUrl("my/path/mapping");
		sap.ui.require.toUrl("my/path/mapping");
		sap.ui.require.toUrl("my/path/mapping/");
		sap.ui.require.toUrl("my/path/mapping") + ".js";
		sap.ui.require.toUrl("my/path/mapping") + ".js";
		sap.ui.require.toUrl("my/path/mapping") + ".controller.js";
		sap.ui.require.toUrl("my/path/mapping.unknown") + ".js";

		// jQuery.sap.getResourcePath - Non-Literal
		sap.ui.require.toUrl(test);
		sap.ui.require.toUrl(test) + ".json";
		sap.ui.require.toUrl("my/path") + test;
		sap.ui.require.toUrl(test + "asd");
		sap.ui.require.toUrl((function() {})());
		sap.ui.require.toUrl(test()) + (function() {})();

		return A;
	}, true);