/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.encoder"],
	function() {
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
			if (oParam.iTest === 47) {
				oParam.doIt("background-image", "url('" + jQuery.sap.encodeHTML(sContent) + "')");
			} else if (oParam[0]) {
				return "bla";
			}


			jQuery.sap.encodeHTML(sContent);


			jQuery.sap.encodeXML(oParam.value);


			jQuery.sap.encodeXML(jQuery.sap.encodeHTML(jQuery.sap.encodeXML()));

			A.valueOf();

			true ? jQuery.sap.encodeHTML : abc;
			false ? def : jQuery.sap.encodeHTML;

			this.jQuery.sap.encodeXML("abc");
			this.func().jQuery.sap.encodeXML("def");

			arr[23].jQuery.sap.encodeXML("abc");
			arr["hello"].jQuery.sap.encodeXML("def");
			arr[something].jQuery.sap.encodeXML("ghi");
		};

		return A;
	}, /* bExport= */ true);
