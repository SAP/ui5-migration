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
			A.x = jQuery.isArray(oParam.aa);
			A.f = A.x || jQuery.isArray(oParam.bb);

			if (jQuery.isArray(sContent)) {
			}
		};

		return A;
	}, /* bExport= */ true);
