/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/base/util/each"],
	function(each) {
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
				each(oParam.mMap, function(i, value) {
					value.doIt(1);
				});
			}


			each([1,2,3], function(i, value) {
				value.doIt(2);
			});


			each(oParam.mMap, function(i, value) {
				value.doIt(3);
			});
		};

		return A;
	}, /* bExport= */ true);