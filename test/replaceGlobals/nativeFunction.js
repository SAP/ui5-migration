/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.global"],
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
			jQuery.sap.eval("eeeeeevil");

			var a = jQuery.sap.eval("function() { return \"even more evil\"; }");
		};

		return A;
	}, /* bExport= */ true);
