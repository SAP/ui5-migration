/*!
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/core/Configuration"],
	function(Configuration) {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		/**
		 *
		 * @param oParam
		 * @param iIndex
		 */
		A.x = function (oParam, iIndex) {

			if (oParam.control(0)) {
				var sKey = "Test." + iconName + oParam.control;
				if (Configuration && Configuration.getTimezone()) {
					Configuration.setTimezone("America/New_York")
				}
				var x$ = Configuration;

				x$.doit(sKey);

				// should not be replaced because there must be no call arguments
				sap.ui.getCore().getConfiguration("test");

				sap.ui.getCore("test").getConfiguration();

				alert(Configuration.getFormatSettings().getFormatLocale())

				return Configuration.getFormatSettings().getLocale();
			}
		};

		return A;
	}, /* bExport= */ true);