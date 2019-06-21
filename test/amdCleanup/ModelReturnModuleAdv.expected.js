sap.ui.define(
    ["sap/m/MessageBox", "sap/ui/model/json/JSONModel"],
	function(MessageBox, JSONModel) {
	    "use strict";

		var applicationModel = JSONModel.extend("ui.s2p.slc.questionnre.resp.s1.model.ApplicationModel", {
			// app code ...
		});

		jQuery.extend(applicationModel.prototype, ui.s2p.slc.questionnre.resp.s1.mixins.MessageMixin);
		jQuery.extend(applicationModel.prototype, ui.s2p.slc.questionnre.resp.s1.mixins.ValidationMixin);
		return applicationModel;
	},
	true
);