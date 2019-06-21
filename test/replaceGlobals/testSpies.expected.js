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
			Log.debug("yay");
			if (oLogEntry) {
				var expectedText = "testmessage";
				var logWarningStub = sinon.stub(Log, "warning");

				oController.showWarning(expectedText);

				// fails because Log.warning =/= jQuery.sap.log.warning
				assert.ok(logWarningStub.calledWith(expectedText ), "Warning message was logged");
			}
		};

		return A;
	}, /* bExport= */ true);