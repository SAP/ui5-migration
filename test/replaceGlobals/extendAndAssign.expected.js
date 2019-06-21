/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/base/util/merge"],
	function(merge) {
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
					$(sKey).control(merge(sKey, sContent));
				}
				var x$ = merge(sKey, sContent);
				x$.control();
			}
			if (oParam.control(1)) {
				var sKey = "Test." + iconName + oParam.control;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					$(sKey).control(Object.assign({}, sKey, sContent));
				}
				var x$ = Object.assign(sKey, sContent);
				x$ += Object.assign(sKey, sContent);
				x$ += Object.assign({}, sContent);
				x$.control();
			}
		};

		return A;
	}, /* bExport= */ true);