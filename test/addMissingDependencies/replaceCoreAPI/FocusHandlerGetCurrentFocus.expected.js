/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/core/FocusHandler"],
	function(FocusHandler) {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		A.x = function (oParam) {
			var sActiveElementId = FocusHandler.getCurrentFocusedControlId(); 
			var bPass = (oParam.a > oParam.b) && (FocusHandler.getCurrentFocusedControlId() === oParam.id); 
			if (oParam.id !== FocusHandler.getCurrentFocusedControlId()) {
				return [];
			} else {
				return [sActiveElementId, bPass];
			}
		};

		return A;
	}, /* bExport= */ true);