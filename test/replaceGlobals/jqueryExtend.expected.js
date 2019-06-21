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
			Object.assign({}, oParam);
			jQuery.extend(true, {}, {});
			Object.assign({ foo: "foo" }, { bar: "bar" }, { baz: "baz" });
			jQuery.extend({ foo: "foo" }, oParam);
			Object.assign({}, { bar: "bar" }, { baz: "baz" });
			jQuery.extend({}, { bar: "bar" }, { baz: undefined });
        };

        return A;
    }, /* bExport= */ true);