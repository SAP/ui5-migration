/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/ui/thirdparty/jquery", "sap/base/util/merge"],
	function(jQuery, merge) {
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
			merge({}, oParam);
			merge({}, {});
			merge({ foo: "foo" }, { bar: "bar" }, { baz: "baz" });
			merge({ foo: "foo" }, oParam);
			merge({}, { bar: "bar" }, { baz: "baz" });
			merge({}, { bar: "bar" }, { baz: undefined });
			jQuery.sap.extend(false, {}, oParam);
			jQuery.sap.extend(false, {}, {});
			jQuery.sap.extend(false, { foo: "foo" }, { bar: "bar" }, { baz: "baz" });
			jQuery.sap.extend(false, { foo: "foo" }, oParam);
			jQuery.sap.extend(false, {}, { bar: "bar" }, { baz: "baz" });
			jQuery.sap.extend(false, {}, { bar: "bar" }, { baz: undefined });
		};

		return A;
	}, /* bExport= */ true);