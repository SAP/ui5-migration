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
			if (Device.os.ios && Device.system.phone) {
				var sKey = "Test." + (Device.os.ios && Device.system.phone)? true : false;
				oParam(Device.os.ios && Device.system.phone);
				sContent(sKey);
			}
		};

		return A;
	}, /* bExport= */ true);