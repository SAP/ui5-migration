/*!
 * ${copyright}
 */

// A module
sap.ui.define([],
	function() {
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
				if (sap.ui.getCore().getConfiguration() && sap.ui.getCore().getConfiguration().getTimezone()) {
					sap.ui.getCore().getConfiguration().setTimezone("America/New_York")
				}
				var x$ = sap.ui.getCore().getConfiguration();

				x$.doit(sKey);

				// should not be replaced because there must be no call arguments
				sap.ui.getCore().getConfiguration("test");

				sap.ui.getCore("test").getConfiguration();

				alert(sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale())

				return sap.ui.getCore().getConfiguration().getFormatSettings().getLocale();
			}
		};

		return A;
	}, /* bExport= */ true);