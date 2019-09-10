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
			jQuery.sap.extend({}, oParam);
			jQuery.sap.extend(true, {}, {});
			jQuery.sap.extend({ foo: "foo" }, { bar: "bar" }, { baz: "baz" });
			jQuery.sap.extend({ foo: "foo" }, oParam);
			jQuery.sap.extend({}, { bar: "bar" }, { baz: "baz" });
			jQuery.sap.extend({}, { bar: "bar" }, { baz: undefined });
			jQuery.sap.extend(false, {}, oParam);
			jQuery.sap.extend(false, {}, {});
			jQuery.sap.extend(false, { foo: "foo" }, { bar: "bar" }, { baz: "baz" });
			jQuery.sap.extend(false, { foo: "foo" }, oParam);
			jQuery.sap.extend(false, {}, { bar: "bar" }, { baz: "baz" });
			jQuery.sap.extend(false, {}, { bar: "bar" }, { baz: undefined });
		};

		return A;
	}, /* bExport= */ true);
