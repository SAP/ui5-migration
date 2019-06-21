sap.ui.define(["sap/ui/core/Component"], function(Component) {
	var o = Component.getOwnerComponentFor(this._oRouter._oOwner)();
	o();
});