/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/core/Core", "sap/ui/core/Lib"],
	function(Core, Library) {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		A.x = function (oParam) {
			var oResourceBundle = Library.get("sap.m").getResourceBundle();
			var sText = Library.get("sap.ui.core").getResourceBundle().getText("key");
			var sText1 = oResourceBundle.getText(oParam.key);

			return [sText, sText1, Library.get(oParam.library).getResourceBundle().getText("abc")];
		};

		return A;
	}, /* bExport= */ true);