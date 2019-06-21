/* !
 * ${copyright}
 */

// A module
sap.ui.define([],
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
			setTimeout(null["_resize"].bind(null), iDelay);
			setTimeout(this["_resize"].bind(this), iDelay);
			setTimeout(this["_resize"].bind(this, sContent, sContent), iDelay);
			setTimeout(oFocusItem["focus"].bind(oFocusItem), 0);
			setTimeout(null["focus"].bind(null), 0);

			// cantdo
			setTimeout(function () {
				var fnMethod = "focus";
				if (typeof fnMethod === "string" || fnMethod instanceof String) {
					fnMethod = oFocusItem[fnMethod];
				}
				fnMethod.apply(oFocusItem, oParam.aTest || []);
			}.bind(oFocusItem), 0);
			setTimeout(function () {
				var fnMethod = "focus";
				if (typeof fnMethod === "string" || fnMethod instanceof String) {
					fnMethod = oFocusItem[fnMethod];
				}
				fnMethod.apply(oFocusItem, null || []);
			}.bind(oFocusItem), 0);
			// nonsense
			setTimeout(function () {
				var fnMethod = "focus";
				if (typeof fnMethod === "string" || fnMethod instanceof String) {
					fnMethod = null[fnMethod];
				}
				fnMethod.apply(null, null || []);
			}.bind(null), 0);


			// function fall
			setTimeout(function() {
				MessageToast.show("NTUploadComplete event triggered.");
			}, 2000);

			setTimeout(function() {
				MessageToast.show("NTUploadComplete event triggered.");
			}, 2000);

			setTimeout(function() {
				MessageToast.show("NTUploadComplete event triggered.");
			}.bind(oParam.iTest, 4, "gg"), 2000);


			setTimeout(function() {
				MessageToast.show("UploadComplete event triggered.");
			}.bind(null, oParam.iTest, 4, "gg"), 2000);


			// cantdo
			setTimeout(function () {
				var fnMethod = function() {
					MessageToast.show("UploadComplete event triggered.");
				};
				if (typeof fnMethod === "string" || fnMethod instanceof String) {
					fnMethod = null[fnMethod];
				}
				fnMethod.apply(null, oParam.aTest || []);
			}.bind(null), 2000);

			setTimeout(function () {
				var fnMethod = function() {
					MessageToast.show("TUploadComplete event triggered.");
				};
				if (typeof fnMethod === "string" || fnMethod instanceof String) {
					fnMethod = this[fnMethod];
				}
				fnMethod.apply(this, oParam.aTest || []);
			}.bind(this), 2000);

			// function memberexpression fall
			setTimeout(this.myFunction.bind(this), 2000);

			// variable case
			setTimeout(myFunction.bind(this), 2000);


			// fall
			setTimeout(oParam.guessWhat.bind(this), iDelay);
			setTimeout(oParam.guessWhat.bind(this), iDelay);
			setTimeout(oParam.guessWhat.bind(this, sContent, sContent), iDelay);

			// this reference
			setTimeout(function () {
				var fnMethod = this.x;
				if (typeof fnMethod === "string" || fnMethod instanceof String) {
					fnMethod = b[fnMethod];
				}
				fnMethod.apply(b, this.args || []);
			}.bind(this), 500);
			setTimeout(function () {
				var fnMethod = "somemethod";
				if (typeof fnMethod === "string" || fnMethod instanceof String) {
					fnMethod = b[fnMethod];
				}
				fnMethod.apply(b, this.args || []);
			}.bind(this), 500);
		};

		return A;
	}, /* bExport= */ true);