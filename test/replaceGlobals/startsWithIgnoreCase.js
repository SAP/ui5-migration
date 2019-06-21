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
			var pattern = "someS";
			var result = jQuery.sap.startsWithIgnoreCase(value, pattern);

			var someObject  = {
				value: "someOtherStRing",
				pattern: "someS"
			};
			var result2 = jQuery.sap.startsWithIgnoreCase(someObject.value, someObject.pattern);

			if (jQuery.sap.startsWithIgnoreCase(someObject.value, someObject.pattern)) {
				result();
			}

			if (value && jQuery.sap.startsWithIgnoreCase(someObject.value, someObject.pattern)) {
				result2();
			}

			jQuery.sap.startsWithIgnoreCase(oParam, "txt");
			jQuery.sap.startsWithIgnoreCase("a", "txt");
			jQuery.sap.startsWithIgnoreCase("a", oParam);

			function getValue() {
				return "loRem";
			}

			function getPattern() {
				return "Lore";
			}

			var result3 = jQuery.sap.startsWithIgnoreCase(getValue(), getPattern());

			var result4 = jQuery.sap.startsWithIgnoreCase(1 < 2 ? "firstValue" : "secondValue", "PATTERN");

			var result5 = jQuery.sap.startsWithIgnoreCase(1 < 2 ? "firstValue" : "secondValue", getPattern());

			var result6 = jQuery.sap.startsWithIgnoreCase(1 < 2 ? "firstValue" : "secondValue", oParam.trim());

			var result7 = jQuery.sap.startsWithIgnoreCase(1 < 2 ? "firstValue" : "secondValue", oParam.substring(4));
		};

		return A;
	}, /* bExport= */ true);
