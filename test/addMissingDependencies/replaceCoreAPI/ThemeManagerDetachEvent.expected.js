/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/core/theming/ThemeManager"],
	function(ThemeManager) {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		A.x = function (oParam) {
			ThemeManager.detachEvent("ThemeChanged", oParam.fnThemeChangeHandler, this);

			ThemeManager.detachEvent("ThemeChanged", oParam.handler1);
		};

		return A;
	}, /* bExport= */ true);