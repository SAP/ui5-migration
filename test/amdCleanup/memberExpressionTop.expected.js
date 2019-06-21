// since it is a "sap" module it will not enforce the namespace to be created at that point
// will make sure sap.ushell.Container exists
sap.ui.define([
	"hpa/cei/amp/plan/core/RouterHelper"
], function(routerHelper) {
    "use strict";

	var getService = function() {}; //eslint-disable-line sap-ui5-no-private-prop
	QUnit.module("RouterHelper", {

		beforeEach: function() {
			routerHelper();
		}

	});

	return getService;
}, true);