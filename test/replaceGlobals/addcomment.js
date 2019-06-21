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
		jQuery.sap.globalEval("'; DROP TABLE Users; --");

		if (jQuery.sap.globalEval("cat /etc/passwd") == 3) {
		}
	};

	return A;
}, /* bExport= */ true);
