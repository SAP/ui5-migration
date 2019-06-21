sap.ui.define([
	"i2d/scm/mrpstklvl/mgmt/s1/ext/model/formatter",
	"sap/ui/model/odata/ODataUtils",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/ui/core/format/DateFormat"
], function (formatter, ODataUtils, Dialog, Button, DateFormat) {
	"use strict";
	return sap.ui.controller("i2d.scm.mrpstklvl.mgmt.s1.ext.controller.DetailsExtension", {
		formatter: formatter,

		onInit: function () {
			this.tempMat = null;
		},
		fnGenerateGraphLinkHrefHash: function (oEvt) {
			var oCrossAppNavigator = sap.ui.core.Component.getService("CrossApplicationNavigation"), // get a handle on the global XAppNav service
				oContext = oEvt.context;
			jQuery.extend(true, {}, window.location);
		}
	});
});