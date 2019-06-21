/*!
 * ${copyright}
 */

// A module
sap.ui.define(['sap/ui/thirdparty/jquery'],
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
		 * @param oEvent
		 */
		A.x = function(oParam, oEvent) {
			var x = {}, $Cell = oEvent.getOffsetX(), superduperEvent = {};
			if (oParam.control(0)) {
				var sKey = "Test." + iconName;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					sKey = superduperEvent.find(':sapTabbable');
					jQuery.merge($Ref.parents().prevAll(), $Ref.prevAll()).find(':sapTabbable');
					var $InteractiveElements = $Cell.find(":sapTabbable, input:sapFocusable, .sapUiTableTreeIcon");
					var aTabbables = jQuery(":sapTabbable", x.$()).get();

					$InteractiveElements(aTabbables);
				}
			}
		};

		return A;
	}, /* bExport= */ true);