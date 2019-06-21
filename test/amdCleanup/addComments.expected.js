sap.ui.define(["sap/ui/core/Component"], function(Component) {
	"use strict";
	var x = {};
	x.prototype.a = function() {

		var o = /*TODO review import and replacement*/
		Component.getOwnerComponentFor(this._oRouter._oOwner)();
		o();
	};

	return x;
});