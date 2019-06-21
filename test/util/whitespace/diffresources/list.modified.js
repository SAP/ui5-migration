/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataListBinding
sap.ui.define([
    "./Context",
    "./ODataParentBinding",
    "./lib/_AggregationCache",
    "./lib/_AggregationHelper",
    "./lib/_Cache",
    "./lib/_GroupLock",
    "./lib/_Helper",
    "sap/base/Log",
    "sap/base/util/uid",
    "sap/ui/base/SyncPromise",
    "sap/ui/model/Binding",
    "sap/ui/model/ChangeReason",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterProcessor",
    "sap/ui/model/FilterType",
    "sap/ui/model/ListBinding",
    "sap/ui/model/Sorter",
    "sap/ui/model/odata/OperationMode",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/array/diff"
], function(
    Context,
	asODataParentBinding,
	_AggregationCache,
	_AggregationHelper,
	_Cache,
	_GroupLock,
	_Helper,
	Log,
	uid,
	SyncPromise,
	Binding,
	ChangeReason,
	FilterOperator,
	FilterProcessor,
	FilterType,
	ListBinding,
	Sorter,
	OperationMode,
	jQuery,
	diff
) {
	"use strict";

	var ODataListBinding = {};

	ODataListBinding.prototype.getDiff = function (aResult, iStart) {
		var aDiff,
			aNewData,
			that = this;

		aNewData = aResult.map(function (oEntity, i) {
			return that.bDetectUpdates
				? JSON.stringify(oEntity)
				: that.aContexts[iStart + i].getPath();
		});
		aDiff = diff(this.aPreviousData, aNewData);
		this.aPreviousData = jQuery.extend(aNewData);
		return aDiff;
	};

	return ODataListBinding;
});