sap.ui.define([
	"hpa/cei/amp/plan/core/RouterHelper"
], function(routerHelper) {
	"use strict";

	QUnit.module("RouterHelper", {

		beforeEach: function() {
			jQuery.sap.declare("sap.mu.shell.Container.getService"); // will make sure sap.ushell.Container exists
			// since it is a "sap" module it will not enforce the namespace to be created at that point
			if (!sap.mu.shell.Container.getService) {
				sap.mu.shell.Container.getService = function() {}; //eslint-disable-line sap-ui5-no-private-prop
			}
			routerHelper();
		}

	});

});