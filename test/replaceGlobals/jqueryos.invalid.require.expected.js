/* !
 * ${copyright}
 */

// A module
sap.ui.require('jquery.sap.mobile');
var a = function(jQuery) {
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
		if (jQuery.os.os) {
			var sKey = "Test." + jQuery.os.os;
			oParam(jQuery.os.os);
			sContent(sKey);
		}
	};

	return A;
};