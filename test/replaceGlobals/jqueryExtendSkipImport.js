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
			jQuery.extend({}, oParam);
        };

        return A;
    }, /* bExport= */ true);
