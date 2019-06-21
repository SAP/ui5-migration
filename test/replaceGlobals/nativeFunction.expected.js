/* !
 * ${copyright}
 */

// A module
sap.ui.define([],
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
			eval("eeeeeevil");

			var a = eval("function() { return \"even more evil\"; }");
		};

		return A;
	}, /* bExport= */ true);