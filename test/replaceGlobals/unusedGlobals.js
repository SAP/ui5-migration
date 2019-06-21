/* !
 * ${copyright}
 */

// A module
sap.ui.define(["jquery.sap.encoder", "jquery.sap.mod1", "jquery.sap.mod2", "jquery.sap.mod3"],
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
			}


			jQuery.sap.encodeHTML(sContent);


			jQuery.sap.encodeXML(oParam.value);


			jQuery.sap.encodeXML(jQuery.sap.encodeHTML(jQuery.sap.encodeXML()));
		};

		return A;
	}, /* bExport= */ true);
