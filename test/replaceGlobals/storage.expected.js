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
			Storage.Type.local;
			Storage.put("test", { lorem: "ipsum" });
			new Storage(Storage.Type.local).remove("test");

			Storage.Type.local;
			Storage.put("test", { lorem: "ipsum" });
			new Storage(Storage.Type.local).remove("test");
			sContent(Storage.Type.local);
		};

		return A;
	}, /* bExport= */ true);