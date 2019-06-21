/* !
 * ${copyright}
 */

// To avoid loading the sap.ui.table lib in every case it is only "lazy"-loaded on lib level and loaded explicitly here:
sap.ui.getCore().loadLibrary('sap.ui.table');

// Provides control sap.ui.comp.valuehelpdialog.ValueHelpDialog.

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
		};

		return A;
	}, /* bExport= */ true);
