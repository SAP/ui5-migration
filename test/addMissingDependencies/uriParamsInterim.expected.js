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
			var x = UriParameters.fromURL(window.location.href);
			return UriParameters.fromURL(window.location.href || oEvent);
		};

		return A;
	}, /* bExport= */ true);