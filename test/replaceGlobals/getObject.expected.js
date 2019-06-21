/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.global", "sap/base/util/ObjectPath"],
	function(jQuery, ObjectPath) {
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
				oParam.doIt("background-image", "url('" + ObjectPath.get(sContent || "") + "')");
			}

			ObjectPath.get("a");

			// 3rd param
			ObjectPath.get("a", oContext);
			ObjectPath.create("a", oContext);
			ObjectPath.create("a", oContext);
			jQuery.sap.getObject("a", 4, oContext);

			// 2nd param
			ObjectPath.get("a");
			ObjectPath.create("a");
			ObjectPath.create("a");
			jQuery.sap.getObject("a", 4);

			// var param
			ObjectPath.get(sContent || "");
			ObjectPath.get(oParam.value || "");
		};

		return A;
	}, /* bExport= */ true);