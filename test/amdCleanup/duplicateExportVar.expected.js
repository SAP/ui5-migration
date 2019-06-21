sap.ui.define(["jquery.sap.global", "sap/m/Dialog", "sap/ui/model/json/JSONModel"], function(jQuery, Dialog, JSONModel) {
	"use strict";

	return Dialog.extend("hpa.cei.cpg.cnt.msg.control.dialog.ApplicationError", {
		title: function() {
			return new JSONModel("ddd");
		}
	});

}, true);