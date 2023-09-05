/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/core/Core"],
	function(Core) {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		A.x = function (oParam) {
			var sActiveElementId = Core.getCurrentFocusedControlId(); 
			var bPass = (oParam.a > oParam.b) && (sap.ui.getCore().getCurrentFocusedControlId() === oParam.id); 
			if (oParam.id !== sap.ui.getCore().getCurrentFocusedControlId()) {
				return [];
			} else {
				return [sActiveElementId, bPass];
			}
		};

		return A;
	}, /* bExport= */ true);