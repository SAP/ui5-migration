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
			var oRm = sap.ui.getCore().createRenderManager();
			var oRm1 = Core.createRenderManager();

			return [oRm, oRm1];
		};

		return A;
	}, /* bExport= */ true);