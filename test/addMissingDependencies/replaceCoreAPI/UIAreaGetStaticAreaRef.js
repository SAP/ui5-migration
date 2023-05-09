/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/core/Core"],
	function(Core) {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		A.x = function (oParam) {
			var oUIArea = sap.ui.getCore().getStaticAreaRef();
			var oUIArea1 = Core.getStaticAreaRef();

			return [oUIArea, oUIArea1];
		};

		return A;
	}, /* bExport= */ true);