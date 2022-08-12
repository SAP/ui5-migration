/*!
 * ${copyright}
 */

// A module
sap.ui.define([/* My Test comment*/
"sap/ui/dom/jquery/control"],
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
					$(sKey).control();
				}
				var x$ = sKey();
				x$.control();
			}
		};

		return A;
	}, /* bExport= */ true);