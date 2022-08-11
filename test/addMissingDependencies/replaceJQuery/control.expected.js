/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/core/Element"],
	function(UI5Element) {
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
		A.x = function (oParam, iIndex) {

			if (UI5Element.closestTo(oParam[0])) {
				var sKey = "Test." + iconName + oParam.control;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					UI5Element.closestTo(sKey);
				}
				var x$ = sKey();
				var oTestControl = UI5Element.closestTo(x$.find(".abc").children().eq(0)[2], true);
				A.controls = x$.control();
				A.control = UI5Element.closestTo(oTestControl.$()[0]);
				A.controlAtPlace = UI5Element.closestTo(x$[iIndex]);
				A.defaultControl = UI5Element.closestTo(x$.find(".abc").children().eq(0)[0]);

				var oActionControl = oParam.getAction().control(this.oView);
				oActionControl.pause();

				return oTestControl;
			}
		};

		return A;
	}, /* bExport= */ true);