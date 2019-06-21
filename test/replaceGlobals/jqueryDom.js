/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.dom"],
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
			var oMyWindow = null;

			var a = jQuery.sap.byId("abc");

			var d = "jkl";
			var e = jQuery.sap.byId(d);

			var f = jQuery.sap.byId("mno" + d);
		};
	}, /* bExport= */ true);
