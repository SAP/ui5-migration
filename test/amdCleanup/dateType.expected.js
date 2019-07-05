sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/UIComponent",
    "sap/ui/base/Object",
    "sap/m/MessageBox",
    "sap/ui/model/type/Date"
],
function(jQuery, UIComponent, UI5Object, MessageBox, TypeDate) {
	"use strict";

	var oSuccessHandler = UI5Object.extend("mine.controller.SuccessHandler", {
		constructor: function (oComponent) {
		}
	});

	oSuccessHandler.prototype.successMessagePopover = function(oComponent) {
		var oDate = new TypeDate();
		return oDate;

	};
}, true);