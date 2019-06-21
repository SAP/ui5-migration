/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.storage"],
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
			jQuery.sap.storage("foo");

			var a = jQuery.sap.storage("bar");

			a = jQuery.sap.storage.bind("abc");

			var b = jQuery.sap.storage + jQuery.sap.storage;
		};
	}, /* bExport= */ true);
