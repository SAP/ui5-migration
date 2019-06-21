/*!
 * ${copyright}
 */
// esap.mu.i.core.Component
/*
 This class contains annotation helpers that might be used from several templates or controls
 */
sap.ui.define(["sap/ui/base/ManagedObject"], function(ManagedObject) {
 "use strict";

 var component = {

 };

 component.getLineItemPresentation.requiresIContext = true;
 component.getChartPresentation.requiresIContext = true;
 component.getNavigationCollection.requiresIContext = true;
 component.foo = function() {
	 /*TODO review import and replacement*/
	 ManagedObject.getNavigationCollection();
 };
 component.foo();
 return component;
}, true);