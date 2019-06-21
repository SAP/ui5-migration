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
		 * @param oLogEntry
		 * @param sContent
		 */
		A.x = function(oLogEntry, sContent) {
			if (oLogEntry) {
				if (oLogEntry.level != jQuery.sap.log.Level.ERROR && oLogEntry.level != jQuery.sap.log.Level.FATAL) {
					return false;
				}

				if (oLogEntry.level == jQuery.sap.log.LogLevel.ERROR || oLogEntry.level === jQuery.sap.log.LogLevel.FATAL) {
					return false;
				}
			}
			sContent(jQuery.sap.log.LogLevel.ERROR);
		};

		return A;
	}, /* bExport= */ true);
