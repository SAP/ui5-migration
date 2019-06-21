jQuery.sap.require("sap.m.MessageBox");

sap.ui.model.json.JSONModel.extend("ui.s2p.slc.questionnre.resp.s1.model.ApplicationModel", {
	// app code ...
});

jQuery.extend(ui.s2p.slc.questionnre.resp.s1.model.ApplicationModel.prototype, ui.s2p.slc.questionnre.resp.s1.mixins.MessageMixin);
jQuery.extend(ui.s2p.slc.questionnre.resp.s1.model.ApplicationModel.prototype, ui.s2p.slc.questionnre.resp.s1.mixins.ValidationMixin);