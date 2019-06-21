/* !
 * ${copyright}
 */

// A module
sap.ui.define([],
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
        A.x = function (oParam, sContent) {
	        oParam = typeof oParam === "string" ? oParam.trim() : oParam != null ? String(oParam).trim() : "";
	        sContent = typeof sContent === "string" ? sContent.trim() : sContent != null ? String(sContent).trim() : "";
	        oParam(sContent);
        };

        return A;
    }, /* bExport= */ true);