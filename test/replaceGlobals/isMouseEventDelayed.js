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
			var test, test2;
			if (jQuery.sap.isMouseEventDelayed) {
				var test = jQuery.sap.isMouseEventDelayed;
				test2 = jQuery.sap.isMouseEventDelayed;
			}
			if (test && jQuery.sap.isMouseEventDelayed || test2) {
				// Unsupported use-case and should not be replaced.
				jQuery.sap.isMouseEventDelayed = test2;
			}
		};

		return A;
	}, /* bExport= */ true);
