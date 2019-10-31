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

			UriParameters.fromURL(oEvent);
			UriParameters.fromQuery(window.location.search);
			UriParameters.fromQuery(window.location.search);
			UriParameters.fromQuery(window.location.search);

			var x = UriParameters.fromQuery(window.location.search);
			return UriParameters.fromURL(window.location.href || oEvent);
		};

		return A;
	}, /* bExport= */ true);