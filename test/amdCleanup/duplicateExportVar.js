sap.ui.define(["jquery.sap.global", "sap/m/Dialog"], function(jQuery, Dialog) {
	"use strict";

	return Dialog.extend("hpa.cei.cpg.cnt.msg.control.dialog.ApplicationError", {
		title: function() {
			return new sap.ui.model.json.JSONModel("ddd");
		}
	});

}, true);