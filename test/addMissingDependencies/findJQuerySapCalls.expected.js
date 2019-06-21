/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/thirdparty/jquery"],
	function(jQuery) {
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
			if (jQuery.sap.isPlainObject(iconInfo.resourceBundle)) {
				var sKey = "Test." + iconName;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					var x = jQuery.sap.isPlainObject(sContent);
					oParam(x);
				}
				jQuery.sap.iterate(oParam, function(i, oObject) {
					oObject(jQuery.sap.doIt(2+i));
				});
			}
		};

		return A;
	}, /* bExport= */ true);