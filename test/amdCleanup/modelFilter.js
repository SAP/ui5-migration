sap.ui.define([], function(){
	"use strict";
	var x = {};
	x.prototype.a = function() {

		var oFilter,
			sQuery = oEvent.getSource().getValue();
		if (sQuery && sQuery.length > 0) {
			oFilter = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery);
			this.getRolesList().getBinding("items").filter([oFilter]);
		} else {
			this.getRolesList().getBinding("items").filter([]);
		}
	};

	return x;
});