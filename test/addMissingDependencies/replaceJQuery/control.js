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
		A.x = function (oParam, iIndex) {

			if (oParam.control(0)) {
				var sKey = "Test." + iconName + oParam.control;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					$(sKey).control()[0];
				}
				var x$ = sKey();
				var oTestControl = x$.find(".abc").children().eq(0).control(2, true);
				A.controls = x$.control();
				A.control = oTestControl.$().control(0);
				A.controlAtPlace = x$.control(iIndex);
				A.defaultControl = x$.find(".abc").children().eq(0).control()[0];

				var oActionControl = oParam.getAction().control(this.oView);
				oActionControl.pause();

				return oTestControl;
			}
		};

		return A;
	}, /* bExport= */ true);