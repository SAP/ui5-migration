/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.encoder"],
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
		A.x = function(oParam, sContent) {
			if (jQuery.sap.resources.isBundle(iconInfo.resourceBundle)) {
				var sKey = "Test." + iconName;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					var sText = iconInfo.resourceBundle.getText(sKey);
				}
			}
		};

		return A;
	}, /* bExport= */ true);
