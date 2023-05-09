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
			var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			var sText = sap.ui.getCore().getLibraryResourceBundle().getText("key");
			var sText1 = oResourceBundle.getText(oParam.key);

			return [sText, sText1, Core.getLibraryResourceBundle(oParam.library).getText("abc")];
		};

		return A;
	}, /* bExport= */ true);