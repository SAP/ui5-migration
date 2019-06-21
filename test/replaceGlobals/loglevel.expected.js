/* !
 * ${copyright}
 */

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
			sContent(Log.Level.ERROR);
		};

		return A;
	}, /* bExport= */ true);