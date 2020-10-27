/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/base/security/URLWhitelist", "sap/base/security/URLListValidator"],
	function(URLWhitelist, URLListValidator) {
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

			URLListValidator();

			// TODO: migration not possible. Use sap/base/security/URLListValidator.clear and sap/base/security/URLListValidator.add instead.
			URLWhitelist.delete(URLListValidator()[oParam]);

			URLListValidator("", "example.com", 1337);

			URLListValidator();
			URLListValidator(sContent);
		};
	}, /* bExport= */ true);