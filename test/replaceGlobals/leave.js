/* !
 * ${copyright}
 */

// A module
sap.ui.define(['jquery.sap.history'],
	function(jQuery) {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		/**
		 *
		 * @param oLogEntry
		 * @param sContent
		 */
		A.x = function(oLogEntry, sContent) {
			if (oLogEntry) {
				if (jQuery.sap.history(sContent)) {
					return false;
				}
			}
		};

		return A;
	}, /* bExport= */ true);
