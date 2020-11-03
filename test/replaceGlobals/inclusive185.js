/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.encoder"],
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
			var b = {};
			var x = 5;
			this.u = 10;

			jQuery.sap.clearUrlWhitelist();

			jQuery.sap.removeUrlWhitelist(oParam);

			jQuery.sap.addUrlWhitelist("", "example.com", 1337);

			jQuery.sap.getUrlWhitelist();
			jQuery.sap.validateUrl(sContent);
		};
	}, /* bExport= */ true);
