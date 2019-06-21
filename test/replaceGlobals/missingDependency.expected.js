/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/thirdparty/jquery", "sap/ui/base/Object", "sap/ui/events/isMouseEventDelayed"],
	function(jQuery, BaseObject /*,jQuery1*/, isMouseEventDelayed) {
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
			if (isMouseEventDelayed()) {
				test = isMouseEventDelayed();
				test2 = isMouseEventDelayed();
			}
			if (test && isMouseEventDelayed() || test2) {
				test2 = test2 || isMouseEventDelayed();
			}
			test2();
			var oConfiguration = jQuery.extend(true,{}, oTargetConfig.configurations[iIndex]);
			oConfiguration(test2);
		};

		return A;
	}, /* bExport= */ true);