/* !
 * ${copyright}
 */

// A module
sap.ui.define(["newA", "newB", "sap/ui/thirdparty/jquery", "c"],
	function(newA, newB, jQuery) {
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
			newA("abc");
			newB("def");
			c_fnct("ghi");

			jQuery("bla");
		};

		return A;
	}, /* bExport= */ true);