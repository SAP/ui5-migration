/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/base/util/getObject"],
	function(getObject) {
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

			getObject(window, "my.super.duper.test", true).module = {a: 5};
			getObject(window, "my.super.duper", true).test = {a: 7};
			window["my"] = {a: 7};

			getObject(oParam, "my.super.duper.test", true).module = {a: 5};
			oParam["my"] = {a: 7};
		};

		return A;
	}, /* bExport= */ true);