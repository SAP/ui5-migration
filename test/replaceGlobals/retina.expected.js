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
			if (window.devicePixelRatio >= 2) {
			}

			var a = window.devicePixelRatio >= 2 ? oParam : sContent;

			a();
		};

		return A;
	}, /* bExport= */ true);