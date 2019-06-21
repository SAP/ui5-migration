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
			var b = {};
			var x = 5;
			this.u = 10;

			setInterval(function() {
				this.x += 3;
			}.bind(b), 200);

			setInterval(function () {
				var fnMethod = function() {
					x += 3;
				};
				if (typeof fnMethod === "string" || fnMethod instanceof String) {
					fnMethod = b[fnMethod];
				}
				fnMethod.apply(b, this.u || []);
			}.bind(this), 200);

			setInterval(function(c, d) {
				this.y = c * 5 + d;
			}.bind(b, 56, 23), 500);

			setInterval(this.x.bind(b), 500);
			setInterval(this.x.bind(b, 1, 2, 3), 500);
			setInterval(this.x.bind(b), 500);
			setInterval(b["somemethod"].bind(b), 500);
			setInterval(b["somemethod"].bind(b, 1, 2, 3), 500);
			setInterval(b["somemethod"].bind(b), 500);

			// cantdo as parameters are unknown
			setInterval(function () {
				var fnMethod = this.x;
				if (typeof fnMethod === "string" || fnMethod instanceof String) {
					fnMethod = b[fnMethod];
				}
				fnMethod.apply(b, this.args || []);
			}.bind(this), 500);
			setInterval(function () {
				var fnMethod = "somemethod";
				if (typeof fnMethod === "string" || fnMethod instanceof String) {
					fnMethod = b[fnMethod];
				}
				fnMethod.apply(b, this.args || []);
			}.bind(this), 500);
		};
	}, /* bExport= */ true);