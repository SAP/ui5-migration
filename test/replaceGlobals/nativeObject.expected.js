/* !
* ${copyright}
*/

// A module
sap.ui.define(['jquery.sap.resources'],
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
		 * @param sContent
		 */
		A.x = function(oParam, sContent) {
			A.x = Array.isArray(oParam.aa);
			A.f = A.x || Array.isArray(oParam.bb);

			if (Array.isArray(sContent)) {
			}
		};

		return A;
	}, /* bExport= */ true);