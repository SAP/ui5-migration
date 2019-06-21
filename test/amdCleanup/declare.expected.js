sap.ui.define(["sap/ui/core/Component"], function(Component) {
    "use strict";

	var component = Component.extend("esap.m.sample.TimePicker.Component", {

		metadata : {
			rootView : {
				"viewName": "esap.m.sample.TimePicker.TimePicker",
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

	return component;
}, true);