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

			var a = jQuery.sap.domById("abc");

			var b = jQuery.sap.domById("def", oMyWindow);

			var byId = jQuery.sap.domById;

			var c = byId("ghi");

			byId = jQuery.sap.domById;

			var d = "jkl";
			var e = jQuery.sap.domById(d);

			var f = jQuery.sap.domById("mno" + d);
		};
	}, /* bExport= */ true);
