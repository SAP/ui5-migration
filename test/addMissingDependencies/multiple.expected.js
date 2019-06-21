/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/events/jquery/EventExtension", "sap/ui/dom/jquery/control"],
	function(PseudoTypes) {
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
					$(sKey).control();
				}
				var x$ = sKey();
				x$.control();
			}
			var oEvent = oParam.getEvent();
			PseudoTypes.getPseudoTypes();
		};

		return A;
	}, /* bExport= */ true);