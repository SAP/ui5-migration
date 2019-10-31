/* !
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
		 * @param sContent
		 */
		A.x = function(oParam, sContent) {
			if (oParam.iTest === 47) {
				oParam.doIt("background-image", "url('" + UriParameters.fromURL(window.location.href) + "')");
			}


			A.b(UriParameters.fromURL(window.location.href));


			A.m = String(UriParameters.fromURL(window.location.href));
			A.m2 = String(UriParameters.fromURL(window.location.href).get(2));
			A.m3 = String(UriParameters.fromURL(sContent || window.location.href).get(2));
		};

		return A;
	}, /* bExport= */ true);