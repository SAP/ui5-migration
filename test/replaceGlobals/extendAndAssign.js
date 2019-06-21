/*!
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
		A.x = function (oParam, sContent) {

			if (oParam.control(0)) {
				var sKey = "Test." + iconName + oParam.control;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					$(sKey).control(jQuery.sap.extend(true, sKey, sContent));
				}
				var x$ = jQuery.sap.extend(true, sKey, sContent);
				x$.control();
			}
			if (oParam.control(1)) {
				var sKey = "Test." + iconName + oParam.control;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					$(sKey).control(jQuery.sap.extend(false, {}, sKey, sContent));
				}
				var x$ = jQuery.sap.extend(false, sKey, sContent);
				x$ += jQuery.sap.extend(sKey, sContent);
				x$ += jQuery.sap.extend({}, sContent);
				x$.control();
			}
		};

		return A;
	}, /* bExport= */ true);