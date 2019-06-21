/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.encoder"],
	function() {
		"use strict";
		var encodeXML = function(bar) {
			return "foo";
		};

		encodeXML("there");

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
			var encodeXML, encodeXML0, encodeXML1 = 5;

			if (oParam.iTest === 47) {
				oParam.doIt("background-image", "url('" + jQuery.sap.encodeHTML(sContent) + "')");
			}


			jQuery.sap.encodeHTML(sContent);


			jQuery.sap.encodeXML(oParam.value);


			jQuery.sap.encodeXML(jQuery.sap.encodeHTML(jQuery.sap.encodeXML()));
		};

		/**
		 * function
		 */
		function encodeXML2(foo) {
			return "bar";
		}
		encodeXML2("used here");

		/**
		 * function parameter
		 */
		A.y = function(encodeXML3) {
			return encodeXML3;
		};

		/**
		 * object property
		 */
		var B = {
			encodeXML: true
		};

		/**
		 * label
		 */
		encodeXML: for (var i=0; i<3; i++) {
			jQuery.sap.encodeXML("bar");
			if (i < 1)				{
				break encodeXML;
			}
		}

		return A;
	}, /* bExport= */ true);
