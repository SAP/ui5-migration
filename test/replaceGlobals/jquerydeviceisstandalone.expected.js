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
			if (window.navigator.standalone) {
				var sKey = "Test." + window.navigator.standalone;
				oParam(window.navigator.standalone);
				sContent(sKey);
			}
		};

		return A;
	}, /* bExport= */ true);