/*!
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.global", "sap/ui/thirdparty/jquery"],
	function(jQuery, jQueryDOM) {
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
			jQuery.sap.require(sContent+"a");
			if (oParam.control(0)) {
				var sKey = "Test." + iconName + oParam.control;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					jQueryDOM(sKey).control(jQueryDOM.extend(false, {}, sKey, sContent));
				}
				var x$ = jQueryDOM.extend(false, sKey, sContent);
				x$ += jQueryDOM.extend(sKey, sContent);
				x$ += jQueryDOM.extend({}, sContent);
				x$.control();
			}
		};

		return A;
	}, /* bExport= */ true);