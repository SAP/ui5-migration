/* !
 * ${copyright}
 */

// A module
sap.ui.define([], function() {
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
	A.x = function(oParam) {
		if (sap.ui.getCore().getLoadedLibraries()) {
			return true;
		} else {
			return false;
		}
	};

	return A;
}, /* bExport= */ true);
