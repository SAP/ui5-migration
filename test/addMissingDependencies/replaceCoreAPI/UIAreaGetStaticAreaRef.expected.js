/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/core/UIArea"],
	function(UIArea) {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		A.x = function (oParam) {
			var oUIArea = UIArea.getStaticAreaRef();
			var oUIArea1 = UIArea.getStaticAreaRef();

			return [oUIArea, oUIArea1];
		};

		return A;
	}, /* bExport= */ true);