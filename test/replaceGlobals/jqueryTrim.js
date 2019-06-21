/* !
 * ${copyright}
 */

// A module
sap.ui.define(['sap/ui/thirdparty/jquery'],
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
        A.x = function (oParam, sContent) {
	        oParam = jQuery.trim(oParam);
	        sContent = jQuery.trim(sContent);
	        oParam(sContent);
        };

        return A;
    }, /* bExport= */ true);
