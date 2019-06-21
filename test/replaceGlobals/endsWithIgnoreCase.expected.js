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
			var result = typeof pattern == "string" && pattern ? value.toLowerCase().endsWith(pattern.toLowerCase()) : false;

			var someObject  = {
				value: "someOtherStRing",
				pattern: "rStrInG"
			};
			var result2 = typeof someObject.pattern == "string" && someObject.pattern ? someObject.value.toLowerCase().endsWith(someObject.pattern.toLowerCase()) : false;

			oParam.toLowerCase().endsWith("txt");
			"a".endsWith("txt");
			typeof oParam == "string" && oParam ? "a".endsWith(oParam.toLowerCase()) : false;

			function getValue() {
				return "loRem";
			}

			function getPattern() {
				return "em";
			}

			var result3 = typeof getPattern() == "string" && getPattern() ? getValue().toLowerCase().endsWith(getPattern().toLowerCase()) : false;

			var result4 = (1 < 2 ? "firstValue" : "secondValue").toLowerCase().endsWith("value");

			var result5 = typeof getPattern() == "string" && getPattern() ? (1 < 2 ? "firstValue" : "secondValue").toLowerCase().endsWith(getPattern().toLowerCase()) : false;
		};

		return A;
	}, /* bExport= */ true);