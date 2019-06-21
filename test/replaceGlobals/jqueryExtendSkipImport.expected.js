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
			Object.assign({}, oParam);
        };

        return A;
    }, /* bExport= */ true);