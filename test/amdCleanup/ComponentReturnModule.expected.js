sap.ui.define(["sap/ui/generic/app/AppComponent"], function(AppComponent) {
    "use strict";
	sap.ui.getCore().loadLibrary("sap.ui.generic.app");

	var component = AppComponent.extend("mine.Component", {
		metadata: {
			"manifest": "json"
		}
	});

	return component;
}, true);