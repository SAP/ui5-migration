sap.ui.define([],
	function() {
		"use strict";

		// different usage types - jQuery.sap.getModulePath - Literal
		var test = jQuery.sap.getModulePath("test.123", ".json");
		if (jQuery.sap.getModulePath("test.123", ".json")) {
			var test = "Test." + jQuery.sap.getModulePath("test.123", ".json");
			oParam(jQuery.sap.getModulePath("test.mypath", ".txt"));
		}

		// jQuery.sap.getModulePath - Literal - different parameter combinations
		jQuery.sap.getModulePath("my.module.mapping");
		jQuery.sap.getModulePath("my/module.mapping");
		jQuery.sap.getModulePath("my.module/mapping");
		jQuery.sap.getModulePath("/my.module.mapping");
		jQuery.sap.getModulePath("/my/module.mapping");
		jQuery.sap.getModulePath("/my.module/mapping");
		jQuery.sap.getModulePath("/my.module.mapping/");
		jQuery.sap.getModulePath("/my/module.mapping/");
		jQuery.sap.getModulePath("/my.module/mapping/");

		// jQuery.sap.getModulePath - Non-Literal
		jQuery.sap.getModulePath(test);
		jQuery.sap.getModulePath(test, ".json");
		jQuery.sap.getModulePath("my/path", test);
		jQuery.sap.getModulePath(test + "");
		jQuery.sap.getModulePath(function() {}());
		jQuery.sap.getModulePath(test(), function() {}());

		// jQuery.sap.getResourcePath - Literal - different usages
		var test = jQuery.sap.getResourcePath("test/123");
		if (jQuery.sap.getResourcePath("test/123")) {
			var test = "Test." + jQuery.sap.getResourcePath("test/123");
			oParam(jQuery.sap.getResourcePath("test/mypath"));
		}

		// different parameter combinations - getResourcePath - Literal
		jQuery.sap.getResourcePath("my/path/mapping");
		jQuery.sap.getResourcePath("/my/path/mapping");
		jQuery.sap.getResourcePath("my/path/mapping/");
		jQuery.sap.getResourcePath("my/path/mapping", ".js");
		jQuery.sap.getResourcePath("my/path/mapping.js");
		jQuery.sap.getResourcePath("my/path/mapping.controller.js");
		jQuery.sap.getResourcePath("my/path/mapping.unknown.js");

		// jQuery.sap.getResourcePath - Non-Literal
		jQuery.sap.getResourcePath(test);
		jQuery.sap.getResourcePath(test, ".json");
		jQuery.sap.getResourcePath("my/path", test);
		jQuery.sap.getResourcePath(test + "asd");
		jQuery.sap.getResourcePath(function() {}());
		jQuery.sap.getResourcePath(test(), function() {}());

		return A;
	}, true);
