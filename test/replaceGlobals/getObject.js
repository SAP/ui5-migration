/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.global"],
	function(jQuery) {
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
				oParam.doIt("background-image", "url('" + jQuery.sap.getObject(sContent) + "')");
			}

			jQuery.sap.getObject("a");

			// 3rd param
			jQuery.sap.getObject("a", undefined, oContext);
			jQuery.sap.getObject("a", null, oContext);
			jQuery.sap.getObject("a", 0, oContext);
			jQuery.sap.getObject("a", 4, oContext);

			// 2nd param
			jQuery.sap.getObject("a", undefined);
			jQuery.sap.getObject("a", null);
			jQuery.sap.getObject("a", 0);
			jQuery.sap.getObject("a", 4);

			// var param
			jQuery.sap.getObject(sContent);
			jQuery.sap.getObject(oParam.value);
		};

		return A;
	}, /* bExport= */ true);
