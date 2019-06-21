/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/base/Version"],
	function(Version) {
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
				var useFlexBoxPolyfillCompatVersion = new Version(this.oConfiguration.getCompatibilityVersion("flexBoxPolyfill"));

				var aPromises = [];
				if (oParam && Version(oParam._version).compareTo("1.9.0") >= 0) {
					aPromises.push(that.getLibraryResourceBundle(sKey, true));
				}
			}
		};

		return A;
	}, /* bExport= */ true);