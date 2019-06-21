sap.ui.define([], function() {
    "use strict";
	/**
	 * Add test pages to this test suite function.
	 *
	 */
	function suite() {
		var oSuite = new parent.jsUnitTestSuite(),
			sContextPath = window.location.pathname.split("test-resources")[0];

		return oSuite;
	}
});