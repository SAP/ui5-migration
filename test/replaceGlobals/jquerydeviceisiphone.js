/* !
 * ${copyright}
 */

// A module
sap.ui.define([],
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
			if (jQuery.device.is.iphone) {
				var sKey = "Test." + jQuery.device.is.iphone? true : false;
				oParam(jQuery.device.is.iphone);
				sContent(sKey);
			}
		};

		return A;
	}, /* bExport= */ true);
