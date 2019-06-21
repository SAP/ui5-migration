/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.core.
 */
sap.ui.define(['sap/ui/base/DataType', './CalendarType', './library', './Core'],
	function(DataType, CalendarType, library) {
	"use strict";

	var test = sap.ui.core.AbsoluteCSSSize.Select;

	return test(DataType.String) + CalendarType.Gregorian;

});
