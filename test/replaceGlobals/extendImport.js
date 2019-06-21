sap.ui.define([], function() {
	this.oDataInitialBkp = jQuery.extend(true, [], this.oJSONModel);
	this.oDataInitial = jQuery.extend(true, {}, this.getData());
	return {};
});