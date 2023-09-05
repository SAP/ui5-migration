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
			var oControl = sap.ui.getCore().byId("id1");
			var oControl1 = Core.byId(oParam.id);

			return [oControl, oControl1];
		};

		return A;
	}, /* bExport= */ true);