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
				oParam.doIt("background-image", "url('" + sContent.endsWith("asd") + "')");
			}


			sContent.endsWith("meh");


			oParam.value.startsWith("a");

			if (oParam.value.startsWith("a") || oParam.value.startsWith("a")) {
				A.b = oParam.value.startsWith("a");
			}

			typeof sContent == "string" && sContent.length > 0 && sContent.startsWith(sContent);

			typeof a.b.c.d == "string" && a.b.c.d.length > 0 && sContent.startsWith(a.b.c.d);

			//string methods
			sContent.endsWith(sContent.toString());
			sContent.endsWith(sContent.toLowerCase());
			sContent.endsWith(sContent.toUpperCase());

			jQuery.sap.startsWith(sContent, "a" + "b"); // cannot

			jQuery.sap.endsWith(sContent, fnSomething("bla")); // cannot
		};

		return A;
	}, /* bExport= */ true);