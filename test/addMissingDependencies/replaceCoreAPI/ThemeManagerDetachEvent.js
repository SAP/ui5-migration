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
			sap.ui.getCore().detachThemeChanged(oParam.fnThemeChangeHandler, this);

			Core.detachThemeChanged(oParam.handler1);
		};

		return A;
	}, /* bExport= */ true);