/* !
 * ${copyright}
 */

// A module
sap.ui.define([],
	function() {
		"use strict";

		var a = function() {};

		var b = {
			a: function() {}
		};

		var c = (true ? function() {} : a)();
	})