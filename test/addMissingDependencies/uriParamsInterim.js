/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/base/util/UriParameters"],
	function(UriParameters) {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		/**
		 *
		 * @param oParam
		 * @param oEvent
		 */
		A.x = function (oParam, oEvent) {
			var x = new UriParameters(window.location.href);
			return new UriParameters(window.location.href || oEvent);
		};

		return A;
	}, /* bExport= */ true);