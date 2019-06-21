/*!
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.global"],
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
		A.x = function (oParam, sContent) {
			jQuery.sap.require(sContent+"a");
			if (oParam.control(0)) {
				var sKey = "Test." + iconName + oParam.control;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					jQuery(sKey).control(jQuery.extend(false, {}, sKey, sContent));
				}
				var x$ = jQuery.extend(false, sKey, sContent);
				x$ += jQuery.extend(sKey, sContent);
				x$ += jQuery.extend({}, sContent);
				x$.control();
			}
		};

		return A;
	}, /* bExport= */ true);