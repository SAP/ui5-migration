/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/dom/jquery/control"],
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

			if (oParam.testore(0)) {
				var sKey = "Test." + iconName;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					$(sKey).control();
				}
			}
		};

		return A;
	}, /* bExport= */ true);