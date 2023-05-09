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
			if (oParam.condition && ThemeManager.themeLoaded) { 
				return [oParam.a];
			} else {
				return ThemeManager.themeLoaded;
			}
		};

		return A;
	}, /* bExport= */ true);