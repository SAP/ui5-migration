/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.encoder"],
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
			var b = {};

			jQuery.sap.removeUrlWhitelist(200);

			jQuery.sap.removeUrlWhitelist(b);

			jQuery.sap.removeUrlWhitelist(this.x);
		};
	}, /* bExport= */ true);
