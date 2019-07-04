sap.ui.define(["jquery.sap.global", "sap/ui/core/UIComponent", "sap/ui/base/Object", "sap/m/MessageBox"],
function (jQuery, UIComponent, UI5Object, MessageBox) {
	"use strict";

	var oSuccessHandler = UI5Object.extend("mine.controller.SuccessHandler", {
		constructor: function (oComponent) {
		}
	});

	oSuccessHandler.prototype.successMessagePopover = function(oComponent) {
		var oDate = new sap.ui.model.type.Date();
		return oDate;

	};
}, true);
