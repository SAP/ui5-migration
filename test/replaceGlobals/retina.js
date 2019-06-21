/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.mobile"],
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
			if (jQuery.support.retina) {
			}

			var a = jQuery.support.retina ? oParam : sContent;

			a();
		};

		return A;
	}, /* bExport= */ true);
