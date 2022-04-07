/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/thirdparty/jquery", /* jQuery Plugin "zIndex"*/
"sap/ui/dom/jquery/zIndex"],
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
		 * @param oEvent
		 */
		A.x = function (oParam, oEvent) {
			// jQuery Plugin "zIndex"
			var x = jQuery(oEvent).zIndex();
			x();
		};

		return A;
	}, /* bExport= */ true);