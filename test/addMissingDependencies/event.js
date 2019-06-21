/*!
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
		 * @param oEvent
		 */
		A.x = function (oParam, oEvent) {
			var x = oEvent.getOffsetX();
			if (oParam.control(0)) {
				var sKey = "Test." + iconName;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					$(sKey).getOffsetX();
					event.getOffsetX();
					oParam.getOffsetX();
				}
			}
		};

		return A;
	}, /* bExport= */ true);