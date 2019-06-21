/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.script"],
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
			jQuery.sap.parseJS("foo");

			var a = jQuery.sap.parseJS("bar");

			a = jQuery.sap.parseJS.bind("abc");

			var b = jQuery.sap.parseJS("foo") + jQuery.sap.parseJS("bar");
		};
	}, /* bExport= */ true);
