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
			var oMyWindow = null;

			var a = window.document.getElementById("abc");

			var b = (oMyWindow || window).document.getElementById("def");

			var byId = window.document.getElementById;

			var c = byId("ghi");

			byId = window.document.getElementById;

			var d = "jkl";
			var e = d ? window.document.getElementById(d) : null;

			var f = "mno" + d ? window.document.getElementById("mno" + d) : null;
		};
	}, /* bExport= */ true);