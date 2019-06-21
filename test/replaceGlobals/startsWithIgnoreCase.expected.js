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
			var result = typeof pattern == "string" && pattern ? value.toLowerCase().startsWith(pattern.toLowerCase()) : false;

			var someObject  = {
				value: "someOtherStRing",
				pattern: "someS"
			};
			var result2 = typeof someObject.pattern == "string" && someObject.pattern ? someObject.value.toLowerCase().startsWith(someObject.pattern.toLowerCase()) : false;

			if (typeof someObject.pattern == "string" && someObject.pattern && someObject.value.toLowerCase().startsWith(someObject.pattern.toLowerCase())) {
				result();
			}

			if (value && (typeof someObject.pattern == "string" && someObject.pattern && someObject.value.toLowerCase().startsWith(someObject.pattern.toLowerCase()))) {
				result2();
			}

			oParam.toLowerCase().startsWith("txt");
			"a".startsWith("txt");
			typeof oParam == "string" && oParam ? "a".startsWith(oParam.toLowerCase()) : false;

			function getValue() {
				return "loRem";
			}

			function getPattern() {
				return "Lore";
			}

			var result3 = typeof getPattern() == "string" && getPattern() ? getValue().toLowerCase().startsWith(getPattern().toLowerCase()) : false;

			var result4 = (1 < 2 ? "firstValue" : "secondValue").toLowerCase().startsWith("pattern");

			var result5 = typeof getPattern() == "string" && getPattern() ? (1 < 2 ? "firstValue" : "secondValue").toLowerCase().startsWith(getPattern().toLowerCase()) : false;

			var result6 = oParam.trim() && (1 < 2 ? "firstValue" : "secondValue").toLowerCase().startsWith(oParam.trim().toLowerCase());

			var result7 = oParam.substring(4) && (1 < 2 ? "firstValue" : "secondValue").toLowerCase().startsWith(oParam.substring(4).toLowerCase());
		};

		return A;
	}, /* bExport= */ true);