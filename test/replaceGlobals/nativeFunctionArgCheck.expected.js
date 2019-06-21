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
			Object.create(sContent || null);

			var a = Object.create({});

			var b = Object.create(oParam.prototype || null);
		};

		return A;
	}, /* bExport= */ true);