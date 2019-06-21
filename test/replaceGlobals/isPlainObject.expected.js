/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/base/util/isPlainObject"],
	function(isPlainObject) {
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
			}
		};

		return A;
	}, /* bExport= */ true);