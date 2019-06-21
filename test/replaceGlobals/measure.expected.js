/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/performance/Measurement"],
	function(Measurement) {
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
			if (jQuery.sap.resources.isBundle(iconInfo.resourceBundle)) {
				var sKey = "Test." + iconName;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					Measurement.start("coreComplete", "Core.js - complete");
					Measurement.start("coreBoot", "Core.js - boot");
					Measurement.start("coreInit", "Core.js - init");
				}
			}
		};

		return A;
	}, /* bExport= */ true);