/* !
* ${copyright}
*/

// A module
sap.ui.define(['jquery.sap.global'],
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
			jQuery.sap.require("my.test.module");

			if (jQuery("#test") == jQuery.sap.log.Level.ERROR) {
			}
		};

		return A;
	}, /* bExport= */ true);
