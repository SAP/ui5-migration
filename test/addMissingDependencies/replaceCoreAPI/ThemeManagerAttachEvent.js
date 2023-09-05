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
			sap.ui.getCore().attachThemeChanged(oParam.fnThemeChangeHandler, this);

			Core.attachThemeChanged(function() {
				this.themeChanged = true;
			}.bind(oParam));
		};

		return A;
	}, /* bExport= */ true);