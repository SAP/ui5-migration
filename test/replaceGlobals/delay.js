/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.script"],
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
			if (oParam.iTest === 47) {
			}

			// string fall
			jQuery.sap.delayedCall(iDelay, null, "_resize", []);
			jQuery.sap.delayedCall(iDelay, this, "_resize", []);
			jQuery.sap.delayedCall(iDelay, this, "_resize", [sContent, sContent]);
			jQuery.sap.delayedCall(0, oFocusItem, "focus");
			jQuery.sap.delayedCall(0, null, "focus");

			// cantdo
			jQuery.sap.delayedCall(0, oFocusItem, "focus", oParam.aTest);
			jQuery.sap.delayedCall(0, oFocusItem, "focus", null);
			// nonsense
			jQuery.sap.delayedCall(0, null, "focus", null);


			// function fall
			jQuery.sap.delayedCall(2000, this, function() {
				MessageToast.show("NTUploadComplete event triggered.");
			});

			jQuery.sap.delayedCall(2000, this, function() {
				MessageToast.show("NTUploadComplete event triggered.");
			}, []);

			jQuery.sap.delayedCall(2000, this, function() {
				MessageToast.show("NTUploadComplete event triggered.");
			}, [oParam.iTest, 4, "gg"]);


			jQuery.sap.delayedCall(2000, null, function() {
				MessageToast.show("UploadComplete event triggered.");
			}, [oParam.iTest, 4, "gg"]);


			// cantdo
			jQuery.sap.delayedCall(2000, null, function() {
				MessageToast.show("UploadComplete event triggered.");
			}, oParam.aTest);

			jQuery.sap.delayedCall(2000, this, function() {
				MessageToast.show("TUploadComplete event triggered.");
			}, oParam.aTest);

			// function memberexpression fall
			jQuery.sap.delayedCall(2000, this, this.myFunction);

			// variable case
			jQuery.sap.delayedCall(2000, this, myFunction);


			// fall
			jQuery.sap.delayedCall(iDelay, this, oParam.guessWhat);
			jQuery.sap.delayedCall(iDelay, this, oParam.guessWhat, []);
			jQuery.sap.delayedCall(iDelay, this, oParam.guessWhat, [sContent, sContent]);

			// this reference
			jQuery.sap.delayedCall(500, b, this.x, this.args);
			jQuery.sap.delayedCall(500, b, "somemethod", this.args);
		};

		return A;
	}, /* bExport= */ true);
