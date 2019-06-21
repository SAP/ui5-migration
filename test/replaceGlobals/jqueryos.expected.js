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
			if (Device.os.name) {
				var sKey = "Test." + Device.os.name;
				oParam(Device.os.name);
				sContent(sKey);
			}
		};

		return A;
	}, /* bExport= */ true);