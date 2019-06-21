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
			jQuery.extend({}, oParam);
			jQuery.extend(true, {}, {});
			jQuery.extend({ foo: "foo" }, { bar: "bar" }, { baz: "baz" });
			jQuery.extend({ foo: "foo" }, oParam);
			jQuery.extend({}, { bar: "bar" }, { baz: "baz" });
			jQuery.extend({}, { bar: "bar" }, { baz: undefined });
        };

        return A;
    }, /* bExport= */ true);
