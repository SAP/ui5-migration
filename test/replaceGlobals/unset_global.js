/* !
 * ${copyright}
 */

// A module
sap.ui.define(["a", "b", "c", "sap/ui/thirdparty/jquery"],
	function(a, b /*, c, jQuery */) {
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
			a.fnct("abc");
			b.fnct("def");
			c_fnct("ghi");

			jQuery("bla");
		};

		return A;
	}, /* bExport= */ true);
