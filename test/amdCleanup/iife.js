jQuery.sap.declare("ns.NavigationMixin");
jQuery.sap.require("sap.m.Button");

(function() {
	"use strict";

	ns.NavigationMixin = {
		process: function(s) {
			return s + "x";
		}
	};
}());