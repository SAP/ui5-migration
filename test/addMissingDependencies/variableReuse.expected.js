/*!
 * ${copyright}
 */

// A module
sap.ui.define(["m/mymod","x/y/z"],
	function(myModule, mysupermodulefunction) {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		A.b = mysupermodulefunction();

		A.v = myModule.x();

		/**
		 *
		 * @param oParam
		 * @param oEvent
		 */
		A.x = function (oParam, oEvent) {
			var x = mysupermodulefunction("superparam");
			x();
		};

		return A;
	}, /* bExport= */ true);