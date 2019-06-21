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
			var b = {};
			var x = 5;
			this.u = 10;

			jQuery.sap.intervalCall(200, b, function() {
				this.x += 3;
			});

			jQuery.sap.intervalCall(200, b, function() {
				x += 3;
			}, this.u);

			jQuery.sap.intervalCall(500, b, function(c, d) {
				this.y = c * 5 + d;
			}, [56, 23]);

			jQuery.sap.intervalCall(500, b, this.x);
			jQuery.sap.intervalCall(500, b, this.x, [1, 2, 3]);
			jQuery.sap.intervalCall(500, b, this.x, []);
			jQuery.sap.intervalCall(500, b, "somemethod");
			jQuery.sap.intervalCall(500, b, "somemethod", [1, 2, 3]);
			jQuery.sap.intervalCall(500, b, "somemethod", []);

			// cantdo as parameters are unknown
			jQuery.sap.intervalCall(500, b, this.x, this.args);
			jQuery.sap.intervalCall(500, b, "somemethod", this.args);
		};
	}, /* bExport= */ true);
