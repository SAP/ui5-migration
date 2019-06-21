/* !
 * ${copyright}
 */

// A module
sap.ui.define([],
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
				oParam.doIt("background-image", "url('" + sContent.isEqualNode("asd") + "')");
			}


			sContent.isEqualNode("meh");


			oParam.value.isEqualNode("a");

			if (oParam.value.isEqualNode("a") || oParam.value.isEqualNode("a")) {
				A.b = oParam.value.isEqualNode("a");
			}

			sContent.isEqualNode(sContent);

			sContent.isEqualNode(a.b.c.d);

			sContent.isEqualNode("a" + "b");

			sContent.isEqualNode(fnSomething("bla"));
		};

		return A;
	}, /* bExport= */ true);