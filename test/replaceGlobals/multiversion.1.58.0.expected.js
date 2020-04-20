/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/thirdparty/jquery"],
	function(jQuery0) {
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
					$(sKey).control(jQuery0.extend(false, {}, sKey, sContent));
				}
				var x$ = jQuery0.extend(false, sKey, sContent);
				x$ += jQuery0.extend(sKey, sContent);
				x$ += Object.assign({}, sContent);
				x$.control();
			}
		};

		return A;
	}, /* bExport= */ true);