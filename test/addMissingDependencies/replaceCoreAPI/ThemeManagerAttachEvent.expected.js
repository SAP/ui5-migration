/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/core/Core", "sap/ui/core/theming/ThemeManager"],
	function(Core, ThemeManager) {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		A.x = function (oParam) {
			ThemeManager.attachEvent("ThemeChanged", oParam.fnThemeChangeHandler, this);

			ThemeManager.attachEvent("ThemeChanged", function() {
				this.themeChanged = true;
			}.bind(oParam));
		};

		return A;
	}, /* bExport= */ true);