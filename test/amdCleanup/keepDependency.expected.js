sap.ui.define([
	"sap/hpa/gseg/cust/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/hpa/gseg/lib/types/PositiveInteger",
	"sap/hpa/gseg/cust/types/IntToBool"
], function (BaseController, Filter, FilterOperator) {
    var controller = BaseController.extend("my.base.controller", {});
	return controller;
}, true);