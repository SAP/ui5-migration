/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.encoder", "jquery.sap.strings"],
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
			if (oParam.iTest === 47) {
				oParam.doIt("background-image", "url('" + jQuery.sap.padLeft(sContent, "a", 10) + "')");
			}


			jQuery.sap.padLeft(sContent, "b", 110);

			jQuery.sap.padLeft(sContent, "0", 110);
			jQuery.sap.padLeft("yolo", "0", 110);
		};

		return A;
	}, /* bExport= */ true);
