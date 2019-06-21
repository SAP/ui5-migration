/* !
 * ${copyright}
 */

// A module
sap.ui.define(['jquery.sap.global'],
	function() {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		A.x = jQuery.sap.getter(new Item({}));

		A.y = jQuery.sap.getter(false);

		A.z = jQuery.sap.getter(A.x);

		A.xxx = jQuery.sap.getter(this.x);

		return A;
	}, /* bExport= */ true);
