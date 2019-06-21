sap.ui.define([
	"myns/fragment/FragmentDialog"
], function (FragmentDialog) {
	"use strict";

	var CreateEntityDialog = FragmentDialog.extend("CONST.namespace" + ".control.dialog.CreateEntityDialog", {
		_log: jQuery.sap.log
	});
	return CreateEntityDialog;
});