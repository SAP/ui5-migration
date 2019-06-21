/*!
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.script"],
	function(jQuery) {
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
		A.x = function () {
			jQuery.sap.extend(false, {}, {}, {});
			jQuery.sap.uid();
		};

		return A;
	}, /* bExport= */ true);