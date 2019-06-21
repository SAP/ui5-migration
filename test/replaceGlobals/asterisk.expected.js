/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/base/i18n/ResourceBundle", "jquery.sap.encoder"],
	function(ResourceBundle) {
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
			if (ResourceBundle.isBundle(iconInfo.resourceBundle)) {
				var sKey = "Test." + iconName;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					var sText = iconInfo.resourceBundle.getText(sKey);
				}
			}
		};

		return A;
	}, /* bExport= */ true);