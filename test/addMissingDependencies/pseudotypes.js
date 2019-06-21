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

			if (oEvent.getPseudoTypes()) {
				var sKey = "Test." + iconName;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					$(sKey).getPseudoTypes();
				}
			}
		};

		return A;
	}, /* bExport= */ true);