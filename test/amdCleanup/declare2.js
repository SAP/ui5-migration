/*!
 * ${copyright}
 */
// esap.mu.i.core.Component
(function () {
	"use strict";
	/*
	 This class contains annotation helpers that might be used from several templates or controls
	 */
	jQuery.sap.declare("esap.mu.i.core.Component");
	esap.mu.i.core.Component = {

	};
	esap.mu.i.core.Component.getLineItemPresentation.requiresIContext = true;
	esap.mu.i.core.Component.getChartPresentation.requiresIContext = true;
	esap.mu.i.core.Component.getNavigationCollection.requiresIContext = true;
	esap.mu.i.core.Component.foo = function() {
		sap.ui.base.ManagedObject.getNavigationCollection();
	};
	esap.mu.i.core.Component.foo();
})();