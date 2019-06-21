sap.ui.define(["sap/m/Button"], function(Button) {
    "use strict";

	var navigationMixin = {
		process: function(s) {
			return s + "x";
		}
	};

	return navigationMixin;
}, true);