jQuery.sap.declare("sap.m.sample.TimePicker.Component");
jQuery.sap.require("sap.ui.core.Core");

sap.ui.core.Component.extend("sap.m.sample.TimePicker.Component", {

	metadata : {
		rootView : {
			"viewName": "sap.m.sample.TimePicker.TimePicker",
			"type": "XML",
			"async": true
		},
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				files : [
					"TimePicker.view.xml",
					"TimePicker.controller.js"
				]
			}
		}
	}
});

jQuery.sap.require("sap.ui.core.EnabledPropagator");
