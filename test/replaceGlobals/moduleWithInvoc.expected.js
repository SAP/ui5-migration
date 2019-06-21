/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/base/util/JSTokenizer"],
	function(JSTokenizer) {
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
			JSTokenizer().parseJS("foo");

			var a = JSTokenizer().parseJS("bar");

			a = JSTokenizer().parseJS.bind("abc");

			var b = JSTokenizer().parseJS("foo") + JSTokenizer().parseJS("bar");
		};
	}, /* bExport= */ true);