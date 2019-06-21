/* !
 * ${copyright}
 */

// A module
sap.ui.define([],
	function() {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		/**
		 *
		 * @param oParam
		 * @param sContent
		 */
		A.x = function(oParam, sContent) {
			// non literal cases
			var path, mapping;

			jQuery.sap.registerResourcePath("my/resource/path", "my/resources");
			jQuery.sap.registerResourcePath("my/resource/path/", "my/resources/");
			jQuery.sap.registerResourcePath(path, mapping);

			jQuery.sap.registerModulePath("my.module.path", "my/modules");
			jQuery.sap.registerModulePath("my.module.path/", "my/modules/");
			jQuery.sap.registerModulePath("my.module.path", "");
			jQuery.sap.registerModulePath("my.module.path/", "");
			jQuery.sap.registerModulePath(path, mapping);
		};

		return A;
	}, /* bExport= */ true);
