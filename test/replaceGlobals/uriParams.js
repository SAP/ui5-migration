/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.script"],
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
			if (oParam.iTest === 47) {
				oParam.doIt("background-image", "url('" + jQuery.sap.getUriParameters() + "')");
			}


			A.b(jQuery.sap.getUriParameters());
			// window
			A.w(jQuery.sap.getUriParameters(window.location.href));
			A.w(jQuery.sap.getUriParameters(window.location.search));
			// location
			A.bl(jQuery.sap.getUriParameters(location.href));
			A.bl(jQuery.sap.getUriParameters(location.search));


			A.m = String(jQuery.sap.getUriParameters());
			A.m2 = String(jQuery.sap.getUriParameters().get(2));
			A.m3 = String(jQuery.sap.getUriParameters(sContent).get(2));
		};

		return A;
	}, /* bExport= */ true);
