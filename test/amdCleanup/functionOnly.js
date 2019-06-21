(function() {

	var x = {};
	x.prototype.a = function() {

		var o = sap.ui.core.Component.getOwnerComponentFor(this._oRouter._oOwner)();
		o();
	};

	return x;
}());

