/* !
 * ${copyright}
 */

// A module
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
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
					jQuery.sap.measure.start("coreComplete", "Core.js - complete");
					jQuery.sap.measure.start("coreBoot", "Core.js - boot");
					jQuery.sap.measure.start("coreInit", "Core.js - init");
				}
			}
		};

		return A;
	}, /* bExport= */ true);
