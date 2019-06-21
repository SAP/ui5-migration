/* !
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
		 * @param sContent
		 */
		A.x = function (oParam, sContent) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"), // get a handle on the global XAppNav service
				oContext = oEvt.context,
				oWindow = jQuery.extend({}, window.location);
		};

		return A;
	}, /* bExport= */ true);