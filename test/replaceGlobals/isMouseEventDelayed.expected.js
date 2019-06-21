/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/events/isMouseEventDelayed"],
	function(isMouseEventDelayed) {
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
			var test, test2;
			if (isMouseEventDelayed()) {
				var test = isMouseEventDelayed();
				test2 = isMouseEventDelayed();
			}
			if (test && isMouseEventDelayed() || test2) {
				// Unsupported use-case and should not be replaced.
				jQuery.sap.isMouseEventDelayed = test2;
			}
		};

		return A;
	}, /* bExport= */ true);