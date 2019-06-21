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
			var aElements = [1, 2, 3];

			var b = jQuery.inArray(4, aElements);

			var c = $.inArray(5, aElements);

			var iIndex = jQuery.inArray(oParam.value(), [b, c]);

			if (jQuery.inArray(4, aElements) > -1) {
				if (b && jQuery.inArray(3, aElements) != -1) {
					b(5);
					if (c && jQuery.inArray(2, aElements) >= 0) {
						c(6);
					}
				}
			}
		};
	}, /* bExport= */ true);
