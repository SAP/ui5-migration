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
			var aElements = [1, 2, 3];

			var b = aElements ? Array.prototype.indexOf.call(aElements, 4) : -1;

			var c = aElements ? Array.prototype.indexOf.call(aElements, 5) : -1;

			var iIndex = [b, c].indexOf(oParam.value());

			if (aElements && Array.prototype.indexOf.call(aElements, 4) > -1) {
				if (b && (aElements && Array.prototype.indexOf.call(aElements, 3) != -1)) {
					b(5);
					if (c && (aElements && Array.prototype.indexOf.call(aElements, 2) >= 0)) {
						c(6);
					}
				}
			}
		};
	}, /* bExport= */ true);