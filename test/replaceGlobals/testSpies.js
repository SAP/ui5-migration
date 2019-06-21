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
			jQuery.sap.log.debug("yay");
			if (oLogEntry) {
				var expectedText = "testmessage";
				var logWarningStub = sinon.stub(jQuery.sap.log, "warning");

				oController.showWarning(expectedText);

				// fails because Log.warning =/= jQuery.sap.log.warning
				assert.ok(logWarningStub.calledWith(expectedText ), "Warning message was logged");
			}
		};

		return A;
	}, /* bExport= */ true);
