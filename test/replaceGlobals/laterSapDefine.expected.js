/* !
 * ${copyright}
 */

// To avoid loading the sap.ui.table lib in every case it is only "lazy"-loaded on lib level and loaded explicitly here:
sap.ui.getCore().loadLibrary('sap.ui.table');

// Provides control sap.ui.comp.valuehelpdialog.ValueHelpDialog.

// A module
sap.ui.define(["sap/base/Log"],
	function(Log) {
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
				if (oLogEntry.level != Log.Level.ERROR && oLogEntry.level != Log.Level.FATAL) {
					return false;
				}

				if (oLogEntry.level == Log.Level.ERROR || oLogEntry.level === Log.Level.FATAL) {
					return false;
				}
			}
		};

		return A;
	}, /* bExport= */ true);