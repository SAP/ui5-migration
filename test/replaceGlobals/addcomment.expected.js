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
		//Remove evil eval
		jQuery.sap.globalEval("'; DROP TABLE Users; --");

		//Remove evil eval
		if (jQuery.sap.globalEval("cat /etc/passwd") == 3) {
		}
	};

	return A;
}, /* bExport= */ true);