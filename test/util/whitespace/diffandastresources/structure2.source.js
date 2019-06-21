/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ushell_abap/plugins/fcc-transport-ui/test/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});