/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.core.
 */
sap.ui.define(['sap/ui/base/DataType', './CalendarType', './library', './Core'],
	function(DataType, CalendarType, library) {
	 "use strict";

	 // shortcut for sap.ui.core.AbsoluteCSSSize
	 var AbsoluteCSSSize = library.AbsoluteCSSSize;

	 var test = AbsoluteCSSSize.Select;

	 return test(DataType.String) + CalendarType.Gregorian;
	});