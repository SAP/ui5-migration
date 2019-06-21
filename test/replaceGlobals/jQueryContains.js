/*!
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
		A.x = function (oParam, sContent) {

			if (oParam.control(0)) {
				var x = jQuery.contains(oParam, sContent);
				x();
			}
		};

		return A;
	}, /* bExport= */ true);