/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.core.
 */
sap.ui.define([
    'sap/ui/base/DataType',
    './CalendarType',
    "sap/ui/model/odata/AnnotationHelper",
    './Core'
],
	function(DataType, CalendarType, AnnotationHelper) {
	"use strict";

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.core",
		version: "${version}",
		designtime: "sap/ui/core/designtime/library.designtime",
		types: [

			// builtin types
			"any"
		],
		interfaces: [
			"sap.ui.core.IShrinkable"
		],
		controls: [
			"sap.ui.core.ComponentContainer",

		],
		elements: [
			"sap.ui.core.CustomData",
		],
		extensions: {
			"sap.ui.support" : {
				diagnosticPlugins: [
					"sap/ui/core/support/plugins/TechInfo"
				],
				//Configuration used for rule loading of Support Assistant
				publicRules:true,
				internalRules:true
			}
		}
	});

	var thisLib = sap.ui.core;

	thisLib.AbsoluteCSSSize = DataType.createType('sap.ui.core.AbsoluteCSSSize', {
			isValid : function(vValue) {
				// Note: the following regexp by intention is a single regexp literal.
				// It could be made much more readable by constructing it out of (reused) sub-expressions (strings)
				// but this would not be parseable by the metamodel recovery tooling that is used inside SAP
				return /asd$/.test(vValue);
			}
		},
		DataType.getType('string')
	);

	thisLib.routing = thisLib.routing || {};

	var AnnotationHelper = sap.ui.model && sap.ui.model.odata && AnnotationHelper;
	/* eslint-enable no-undef */
	if ( AnnotationHelper ) { // ensure that lazy stub exists before enriching it
		AnnotationHelper.format.requiresIContext = true;
		AnnotationHelper.getNavigationPath.requiresIContext = true;
		AnnotationHelper.isMultiple.requiresIContext = true;
		AnnotationHelper.simplePath.requiresIContext = true;
	}

	return sap.ui.core;

});