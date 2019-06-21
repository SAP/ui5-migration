sap.ui.define(["sap/m/MessageBox", "sap/ui/model/json/JSONModel"], function(MessageBox, JSONModel) {
    "use strict";

	var applicationModel = JSONModel.extend("ui.s2p.slc.questionnre.resp.s1.model.ApplicationModel", {
		// app code ...
	});

	return applicationModel;
}, true);