/* !
* ${copyright}
*/

// A module
sap.ui.define(['sap/ui/util/Storage'],
	function (Storage) {
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
			jQuery.sap.storage.Type.local;
			jQuery.sap.storage.Storage.put("test", { lorem: "ipsum" });
			jQuery.sap.storage(jQuery.sap.storage.Type.local).remove("test");

			$.sap.storage.Type.local;
			$.sap.storage.Storage.put("test", { lorem: "ipsum" });
			$.sap.storage($.sap.storage.Type.local).remove("test");
			sContent($.sap.storage.Type.local);
		};

		return A;
	}, /* bExport= */ true);
