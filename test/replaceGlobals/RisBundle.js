/* !
 * ${copyright}
 */

// A module
sap.ui.define(['jquery.sap.resources'],
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
	 * @param sContent
	 */
	A.x = function(oParam, sContent) {
		A.x = jQuery.sap.resources.isBundle(oParam.aa);
		A.f = jQuery.sap.resources(oParam.bb);

		if (jQuery.sap.resources.isBundle(sContent)) {
		}
	};

	return A;
}, /* bExport= */ true);
