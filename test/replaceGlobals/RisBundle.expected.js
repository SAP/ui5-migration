/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/base/i18n/ResourceBundle"],
function(ResourceBundle) {
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
		A.x = oParam.aa instanceof ResourceBundle;
		A.f = ResourceBundle.create(oParam.bb);

		if (sContent instanceof ResourceBundle) {
		}
	};

	return A;
}, /* bExport= */ true);