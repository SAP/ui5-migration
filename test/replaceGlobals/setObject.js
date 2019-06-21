/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.global"],
	function(jQuery) {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		/**
		 * empty jsdoc description
		 * @param oParam
		 * @param sContent
		 */
		A.x = function(oParam, sContent) {
			if (oParam.iTest === 47) {
				oParam.doIt("background-image", "url('" + 5 + "')");
			}

			jQuery.sap.setObject("my.super.duper.test.module", {a: 5});
			jQuery.sap.setObject("my.super.duper.test", {a: 7});
			jQuery.sap.setObject("my", {a: 7});

			jQuery.sap.setObject("my.super.duper.test.module", {a: 5}, oParam);
			jQuery.sap.setObject("my", {a: 7}, oParam);
		};

		return A;
	}, /* bExport= */ true);
