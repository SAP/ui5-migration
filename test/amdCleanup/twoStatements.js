sap.ui.define([], function(){
	var o = sap.ui.core.Component.getOwnerComponentFor(this._oRouter._oOwner)();
	o = o || sap.ui.core.Component.getOwnerComponentFor(this._oRouter._oOwner)();
	o();
});