/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.xml"],
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
				oParam.doIt("background-image", "url('" + jQuery.sap.isEqualNode(sContent, "asd") + "')");
			}


			jQuery.sap.isEqualNode(sContent, "meh");


			jQuery.sap.isEqualNode(oParam.value, "a");

			if (jQuery.sap.isEqualNode(oParam.value, "a") || jQuery.sap.isEqualNode(oParam.value, "a")) {
				A.b = jQuery.sap.isEqualNode(oParam.value, "a");
			}

			jQuery.sap.isEqualNode(sContent, sContent);

			jQuery.sap.isEqualNode(sContent, a.b.c.d);

			jQuery.sap.isEqualNode(sContent, "a" + "b");

			jQuery.sap.isEqualNode(sContent, fnSomething("bla"));
		};

		return A;
	}, /* bExport= */ true);
