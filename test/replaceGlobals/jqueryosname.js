/* !
 * ${copyright}
 */

// A module
sap.ui.define(['jquery.sap.mobile'],
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
			if (jQuery.os.win) {
				var sKey = "Test." + jQuery.os.win;
				oParam(jQuery.os.win);
				sContent(sKey);
			}
		};

		return A;
	}, /* bExport= */ true);
