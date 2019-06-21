/* !
* ${copyright}
*/

// A module
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
		"use strict";

		/**
		 *
		 * @type {{}}
		 */
		var A = {};

		/**
		 *
		 * @param oParam
		 * @param sContent
		 */
		A.x = function(oParam, sContent) {
			var value = "someStrInG";
			var pattern = "string";
			var result = jQuery.sap.endsWithIgnoreCase(value, pattern);

			var someObject  = {
				value: "someOtherStRing",
				pattern: "rStrInG"
			};
			var result2 = jQuery.sap.endsWithIgnoreCase(someObject.value, someObject.pattern);

			jQuery.sap.endsWithIgnoreCase(oParam, "txt");
			jQuery.sap.endsWithIgnoreCase("a", "txt");
			jQuery.sap.endsWithIgnoreCase("a", oParam);

			function getValue() {
				return "loRem";
			}

			function getPattern() {
				return "em";
			}

			var result3 = jQuery.sap.endsWithIgnoreCase(getValue(), getPattern());

			var result4 = jQuery.sap.endsWithIgnoreCase(1 < 2 ? "firstValue" : "secondValue", "value");

			var result5 = jQuery.sap.endsWithIgnoreCase(1 < 2 ? "firstValue" : "secondValue", getPattern());
		};

		return A;
	}, /* bExport= */ true);
