sap.ui.define([
	"jquery.sap.global"
], function(jQuery) {
	"use strict";
	//Some code
	var bHasChanges = true;
	if (sap.ushell) {
		sap.ushell.Container.setDirtyFlag(bHasChanges);
	}

	if(sap.ui.require) {
		sap.ui.require("sap/ui/core/format/NumberFormat");
	}

	if (sap.ui.loader) {
		sap.ui.loader.config({ noConflict: true });
	}

	return sap.ui.base.ManagedObject.extend("super.module", {
		x: jQuery("#x47")
	});

});