sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/UIComponent",
    "sap/ui/base/Object",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function(jQuery, UIComponent, UI5Object, MessageBox, JSONModel) {
	"use strict";

	var oSuccessHandler = UI5Object.extend("mine.controller.SuccessHandler", {
		constructor: function (oComponent) {
		}
	});

	oSuccessHandler.prototype.successMessagePopover = function(oComponent) {
		var errorModel = new JSONModel();
		errorModel.setJSON(oComponent);

	};

	return oSuccessHandler;

});