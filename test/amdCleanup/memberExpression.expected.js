// will make sure sap.ushell.Container exists
sap.ui.define([
	"hpa/cei/amp/plan/core/RouterHelper"
], function(routerHelper) {
	"use strict";

	QUnit.module("RouterHelper", {

		beforeEach: function() {
		    // since it is a "sap" module it will not enforce the namespace to be created at that point
			if (!sap.mu.shell.Container.getService) {
				sap.mu.shell.Container.getService = function() {}; //eslint-disable-line sap-ui5-no-private-prop
			}
			routerHelper();
		}

	});

});