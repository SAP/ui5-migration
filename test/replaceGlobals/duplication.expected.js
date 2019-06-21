/* !
* ${copyright}
*/

// A module
sap.ui.define(['jquery.sap.global', "sap/base/log", "sap/ui/thirdparty/jquery"],
	function(jQuery, Log, jQuery0) {
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

			if (jQuery0("#test") == Log.Level.ERROR) {
			}
		};

		return A;
	}, /* bExport= */ true);