// Provides class sap.ui.model.odata.ODataTreeBindingAdapter
sap.ui.define(['jquery.sap.global', 'sap/ui/model/TreeBinding', './v2/ODataTreeBinding', 'sap/ui/model/TreeBindingAdapter', 'sap/ui/model/ChangeReason' ,'sap/ui/model/TreeBindingUtils', './OperationMode', "sap/ui/layout/library", "sap/ui/table/library"],
	function(jQuery, TreeBinding, ODataTreeBinding, TreeBindingAdapter, ChangeReason, TreeBindingUtils, OperationMode, library, tableLibrary) {
	    "use strict";

		// shortcut for sap.ui.table.TreeAutoExpandMode
		var TreeAutoExpandMode = tableLibrary.TreeAutoExpandMode;

		// shortcut for sap.ui.layout.GridSpan
		var GridSpan = library.GridSpan;

		return TreeAutoExpandMode();
	});