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
				// TODO: migration not possible. jQuery.sap.history is deprecated. Please use <code>sap.ui.core.routing.Route</code>
				if (jQuery.sap.history(sContent)) {
					return false;
				}
			}
		};

		return A;
	}, /* bExport= */ true);