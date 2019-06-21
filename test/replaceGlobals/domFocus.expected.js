/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.global"],
	function() {
	    "use strict";

		// simple

		var a = abc ? abc.focus() || true : undefined;

		if (a) {
		    a.focus();
		}

		if (b ? b.focus() || true : undefined) { }

		// complex

		var bFocused = undefined;

		bFocused = undefined;

		if (a[b + 3]) {
		    a[b + 3].focus();
		}

		if (hello()) {
		    hello().focus();
		}

		// not supported

		var d = jQuery.sap.focus.bind(a);
	});