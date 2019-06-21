sap.ui.define([
	"my/module"
], function(module) {
    "use strict";

	var applicationContext = {
		_planPath: module()
		// some additional code here
	};

	var coreApplicationContext = applicationContext;
	return applicationContext;
}, true);