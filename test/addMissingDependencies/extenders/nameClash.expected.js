/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/me/Element", "sap/ui/core/Element"],
	function(Element, CoreElement) {
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
			Element.foo();
			if (oParam.control(0)) {
				var sKey = "Test." + iconName + oParam.control;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					$(sKey).control()[0];
				}
				var x$ = sKey();
				var oTestControl = CoreElement;
				A.controls = x$.control();
				A.control = CoreElement;
				A.controlAtPlace = CoreElement;
				A.defaultControl = CoreElement;

				var oActionControl = oParam.getAction().control(this.oView);
				oActionControl.pause();

				return oTestControl;
			}
		};

		return A;
	}, /* bExport= */ true);