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
			if (jQuery.device.is.standalone) {
				var sKey = "Test." + jQuery.device.is.standalone;
				oParam(jQuery.device.is.standalone);
				sContent(sKey);
			}
		};

		return A;
	}, /* bExport= */ true);
