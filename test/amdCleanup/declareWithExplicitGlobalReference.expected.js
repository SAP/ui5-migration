sap.ui.define(["sap/m/Button"], function(Button) {
    "use strict";

	var component = {
		x: 47
	};


	component.prototype.x = function() {
		return 47;
	};

	component.x = 47;
	return component;
}, true);