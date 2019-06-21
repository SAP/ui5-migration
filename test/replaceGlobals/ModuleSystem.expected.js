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
		A.x = function(oParam, sContent) {
			// non literal cases
			var path, mapping;

			sap.ui.loader.config({paths:{"my/resource/path":"my/resources"}});
			sap.ui.loader.config({paths:{"my/resource/path/":"my/resources/"}});
			(function(){var paths={};paths[path]=mapping;sap.ui.loader.config({paths:paths});}());

			sap.ui.loader.config({paths:{"my/module/path":"my/modules"}});
			sap.ui.loader.config({paths:{"my/module/path/":"my/modules/"}});
			sap.ui.loader.config({paths:{"my/module/path":"."}});
			sap.ui.loader.config({paths:{"my/module/path/":"."}});
			(function(){var paths={};paths[path.replace(/\./g,"/")]=mapping||".";sap.ui.loader.config({paths:paths});}());
		};

		return A;
	}, /* bExport= */ true);