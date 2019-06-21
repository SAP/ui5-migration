/* !
 * ${copyright}
 */

// A module
sap.ui.define(['jquery.sap.script'],
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
			if (jQuery.sap.parseJS(iconInfo.resourceBundle)) {
				var sKey = jQuery.sap._createJSTokenizer();
				if (iconInfo.resourceBundle.hasText(sKey)) {
					jQuery.sap.parseJS("coreComplete", "Core.js - complete");
					jQuery.sap.parseJS("coreBoot", "Core.js - boot");
					jQuery.sap.parseJS("coreInit", "Core.js - init");
				}
			}
		};

		return A;
	}, /* bExport= */ true);
