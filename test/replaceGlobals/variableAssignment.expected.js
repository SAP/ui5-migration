sap.ui.define(["myns/fragment/FragmentDialog", "sap/base/Log"], function(FragmentDialog, Log) {
	"use strict";

	var CreateEntityDialog = FragmentDialog.extend("CONST.namespace" + ".control.dialog.CreateEntityDialog", {
		_log: Log
	});
	return CreateEntityDialog;
});