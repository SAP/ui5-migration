/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.global"],
	function() {
		"use strict";

		// simple

		var a = jQuery.sap.focus(abc);

		jQuery.sap.focus(a);

		if (jQuery.sap.focus(b)) { }

		// complex

		var bFocused = jQuery.sap.focus();

		bFocused = jQuery.sap.focus();

		jQuery.sap.focus(a[b + 3]);

		jQuery.sap.focus(hello());

		// not supported

		var d = jQuery.sap.focus.bind(a);
	});
