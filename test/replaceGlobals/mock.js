/* !
 * ${copyright}
 */

// A module
sap.ui.define(['jquery.sap.global'],
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
		sinon.spy(jQuery.sap.log, "error");
	};

	return A;
}, /* bExport= */ true);
