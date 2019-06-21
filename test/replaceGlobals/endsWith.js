/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.strings"],
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
				oParam.doIt("background-image", "url('" + jQuery.sap.endsWith(sContent, "asd") + "')");
			}


			jQuery.sap.endsWith(sContent, "meh");


			jQuery.sap.startsWith(oParam.value, "a");

			if (jQuery.sap.startsWith(oParam.value, "a") || jQuery.sap.startsWith(oParam.value, "a")) {
				A.b = jQuery.sap.startsWith(oParam.value, "a");
			}

			jQuery.sap.startsWith(sContent, sContent);

			jQuery.sap.startsWith(sContent, a.b.c.d);

			//string methods
			jQuery.sap.endsWith(sContent, sContent.toString());
			jQuery.sap.endsWith(sContent, sContent.toLowerCase());
			jQuery.sap.endsWith(sContent, sContent.toUpperCase());

			jQuery.sap.startsWith(sContent, "a" + "b"); // cannot

			jQuery.sap.endsWith(sContent, fnSomething("bla")); // cannot
		};

		return A;
	}, /* bExport= */ true);
