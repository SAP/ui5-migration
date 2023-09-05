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
			if (oParam.condition && ThemeManager.themeLoaded) { 
				return [oParam.a];
			} else {
				return ThemeManager.themeLoaded;
			}
		};

		return A;
	}, /* bExport= */ true);