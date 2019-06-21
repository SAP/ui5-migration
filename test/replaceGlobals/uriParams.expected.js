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
				oParam.doIt("background-image", "url('" + new UriParameters(window.location.href) + "')");
			}


			A.b(new UriParameters(window.location.href));


			A.m = String(new UriParameters(window.location.href));
			A.m2 = String(new UriParameters(window.location.href).get(2));
			A.m3 = String(new UriParameters(sContent || window.location.href).get(2));
		};

		return A;
	}, /* bExport= */ true);