/* !
 * ${copyright}
 */

// A module
sap.ui.define(["thirdparty/jQuery", "sap/base/assert"],
	function(jQuery, assert) {
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


			assert(sContent);


			assert(oParam.value);


			assert(assert(assert()));

			jQuery(oElement).replaceWith("hi there");

			jQuery(assert());

			true || jQuery;

			var $ = jQuery;

			var b = !jQuery;
		};

		return A;
	}, /* bExport= */ true);