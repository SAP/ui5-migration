$.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-core");

sap.ui.define([
	"gs/fin/definestatutoryreportss1/controller/BaseController",
	"sap/ui/comp/valuehelpdialog/ValueHelpDialog"
], function (BaseController,
             ValueHelpDialog) {
	"use strict";
	return BaseController.extend("gs.fin.definestatutoryreportss1.controller.CorrespondenceMapping");
});