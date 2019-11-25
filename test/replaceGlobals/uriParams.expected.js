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
				oParam.doIt("background-image", "url('" + UriParameters.fromQuery(window.location.search) + "')");
			}


			A.b(UriParameters.fromQuery(window.location.search));
			// window
			A.w(UriParameters.fromQuery(window.location.search));
			A.w(UriParameters.fromQuery(window.location.search));
			// location
			A.bl(UriParameters.fromQuery(window.location.search));
			A.bl(UriParameters.fromQuery(window.location.search));


			A.m = String(UriParameters.fromQuery(window.location.search));
			A.m2 = String(UriParameters.fromQuery(window.location.search).get(2));
			A.m3 = String(UriParameters.fromURL(sContent || window.location.href).get(2));
		};

		return A;
	}, /* bExport= */ true);