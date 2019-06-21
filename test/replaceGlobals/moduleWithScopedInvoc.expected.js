/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/util/Storage"],
	function(Storage) {
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
			Storage(window).getInstance("foo");

			var a = Storage(window).getInstance("bar");

			a = Storage(window).getInstance.bind("abc");

			var b = Storage(window).getInstance + Storage(window).getInstance;
		};
	}, /* bExport= */ true);