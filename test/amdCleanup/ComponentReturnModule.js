jQuery.sap.declare("mine.Component");
sap.ui.getCore().loadLibrary("sap.ui.generic.app");
jQuery.sap.require("sap.ui.generic.app.AppComponent");

sap.ui.generic.app.AppComponent.extend("mine.Component", {
	metadata: {
		"manifest": "json"
	}
});