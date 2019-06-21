/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/base/Log"],
function(Log) {
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
		sinon.spy(Log, "error");
	};

	return A;
}, /* bExport= */ true);