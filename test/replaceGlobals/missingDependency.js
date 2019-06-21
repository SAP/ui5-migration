/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.global", "sap/ui/base/Object", "jquery.sap.events"],
	function(jQuery, BaseObject /*,jQuery1*/) {
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
				test = jQuery.sap.isMouseEventDelayed;
				test2 = jQuery.sap.isMouseEventDelayed;
			}
			if (test && jQuery.sap.isMouseEventDelayed || test2) {
				test2 = test2 || jQuery.sap.isMouseEventDelayed;
			}
			test2();
			var oConfiguration = jQuery.extend(true,{}, oTargetConfig.configurations[iIndex]);
			oConfiguration(test2);
		};

		return A;
	}, /* bExport= */ true);