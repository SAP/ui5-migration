/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.global"],
	function(jQuery) {
		"use strict";


		jQuery("#xxx");

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
				oParam.doIt("background-image", "url('" + jQuery.extend(sContent) + "')");
			}


			jQuery.sap.assert(sContent);


			jQuery.sap.assert(oParam.value);


			jQuery.sap.assert(jQuery.sap.assert(jQuery.sap.assert()));

			jQuery(oElement).replaceWith("hi there");

			jQuery(jQuery.sap.assert());

			true || jQuery;

			var $ = jQuery;

			var b = !jQuery;
		};

		return A;
	}, /* bExport= */ true);
