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
			if (jQuery(iconInfo.resourceBundle)) {
				var sKey = "Test." + iconName;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					var x = jQuery.extend({}, sContent);
					oParam(x);
				}
			}
		};

		return A;
	}, /* bExport= */ true);
