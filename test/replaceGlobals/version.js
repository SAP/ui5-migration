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
				var useFlexBoxPolyfillCompatVersion = new jQuery.sap.Version(this.oConfiguration.getCompatibilityVersion("flexBoxPolyfill"));

				var aPromises = [];
				if (oParam && jQuery.sap.Version(oParam._version).compareTo("1.9.0") >= 0) {
					aPromises.push(that.getLibraryResourceBundle(sKey, true));
				}
			}
		};

		return A;
	}, /* bExport= */ true);
