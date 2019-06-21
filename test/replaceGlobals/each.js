/* !
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
		A.x = function(oParam, sContent) {
			if (oParam.iTest === 47) {
				jQuery.each(oParam.mMap, function(i, value) {
					value.doIt(1);
				});
			}


			jQuery.sap.each([1,2,3], function(i, value) {
				value.doIt(2);
			});


			jQuery.each(oParam.mMap, function(i, value) {
				value.doIt(3);
			});
		};

		return A;
	}, /* bExport= */ true);