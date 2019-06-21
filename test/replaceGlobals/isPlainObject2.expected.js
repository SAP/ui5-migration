/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/thirdparty/jquery", "sap/base/util/isPlainObject"],
	function(jQuery, isPlainObject) {
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
			if (isPlainObject(iconInfo.resourceBundle)) {
				var sKey = "Test." + iconName;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					var x = isPlainObject(sContent);
					oParam(x);
				}
				jQuery.each(oParam, function(i, oObject) {
					oObject(sContent);
				});
			}
		};

		return A;
	}, /* bExport= */ true);