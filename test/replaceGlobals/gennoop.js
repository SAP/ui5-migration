/* !
 * ${copyright}
 */

// A module
sap.ui.define(['jquery.sap.global'],
	function($) {
		"use strict";

		var a = $.noop;

		var b = {
			a: $.noop
		};

		var c = (true ? $.noop : a)();
	})