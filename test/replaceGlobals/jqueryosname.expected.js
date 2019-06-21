/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/Device"],
	function(Device) {
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
			if (Device.os.name === "win") {
				var sKey = "Test." + (Device.os.name === "win");
				oParam(Device.os.name === "win");
				sContent(sKey);
			}
		};

		return A;
	}, /* bExport= */ true);