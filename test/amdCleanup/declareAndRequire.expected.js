sap.ui.define([
    "sap/ui/core/Core",
    "sap/ui/core/Component",
    "sap/ui/core/EnabledPropagator"
], function(Core, Component, EnabledPropagator) {
    "use strict";

	var component = Component.extend("sap.m.sample.TimePicker.Component", {

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

	return component;
}, true);