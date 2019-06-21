sap.ui.define([
	"my/module"
], function(module) {
	"use strict";

	jQuery.sap.declare("hpa.cei.amp.plan.core.ApplicationContext");

	var applicationContext = {
		_planPath: module()
		// some additional code here
	};

	hpa.cei.amp.plan.core.ApplicationContext = applicationContext;
	return applicationContext;

});