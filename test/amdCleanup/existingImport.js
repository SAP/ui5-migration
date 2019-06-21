sap.ui.define(["sap/ui/core/Component"], function(Component){
	var o = sap.ui.core.Component.getOwnerComponentFor(this._oRouter._oOwner)();
	o();
});