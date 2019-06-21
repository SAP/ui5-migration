/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.global"],
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
			jQuery.sap.newObject(sContent);

			var a = jQuery.sap.newObject({});

			var b = jQuery.sap.newObject(oParam.prototype);
		};

		return A;
	}, /* bExport= */ true);
