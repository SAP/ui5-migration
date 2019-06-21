/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.encoder"],
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
				oParam.doIt("background-image", "url('" + sContent.padStart(10, "a") + "')");
			}


			sContent.padStart(110, "b");

			sContent.padStart(110, "0");
			"yolo".padStart(110, "0");
		};

		return A;
	}, /* bExport= */ true);