/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.encoder", "sap/base/security/URLListValidator"],
	function(jQuery, URLListValidator) {
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

			URLListValidator.clear();

			// TODO: migration not possible. jQuery.sap.encoder is deprecated. Please use <code>sap.base.security.URLListValidator</code>
			jQuery.sap.removeUrlWhitelist(oParam);

			URLListValidator.add("", "example.com", 1337);

			URLListValidator.entries();
			URLListValidator.validate(sContent);
		};
	}, /* bExport= */ true);