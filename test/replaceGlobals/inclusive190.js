/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/base/security/URLWhitelist"],
	function(URLWhitelist) {
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

			URLWhitelist.clear();

			URLWhitelist.delete(URLWhitelist.entries()[oParam]);

			URLWhitelist.add("", "example.com", 1337);

			URLWhitelist.entries();
			URLWhitelist.validate(sContent);
		};
	}, /* bExport= */ true);