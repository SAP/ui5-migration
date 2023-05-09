/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/core/Core", "sap/ui/core/Element"],
	function(Core, UI5Element) {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		A.x = function (oParam) {
			var oControl = UI5Element.registry.get("id1");
			var oControl1 = UI5Element.registry.get(oParam.id);

			return [oControl, oControl1];
		};

		return A;
	}, /* bExport= */ true);