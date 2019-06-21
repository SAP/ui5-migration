/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/thirdparty/jquery"],
	function(jquery) {
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
			var oMyWindow = null;

			var a = jquery(document.getElementById("abc"));

			var d = "jkl";
			var e = jquery(document.getElementById(d));

			var f = jquery(document.getElementById("mno" + d));
		};
	}, /* bExport= */ true);