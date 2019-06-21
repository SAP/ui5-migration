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

			URLWhitelist.delete(URLWhitelist.entries()[200]);

			URLWhitelist.delete(URLWhitelist.entries()[b]);

			URLWhitelist.delete(URLWhitelist.entries()[this.x]);
		};
	}, /* bExport= */ true);