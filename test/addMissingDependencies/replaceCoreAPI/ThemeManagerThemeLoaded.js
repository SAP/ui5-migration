/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/core/Core"],
	function(Core) {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		A.x = function (oParam) {
			if (oParam.condition && sap.ui.getCore().isThemeApplied()) { 
				return [oParam.a];
			} else {
				return Core.isThemeApplied();
			}
		};

		return A;
	}, /* bExport= */ true);