/* !
 * ${copyright}
 */

// A module
sap.ui.define(["sap/base/util/JSTokenizer"],
	function(JSTokenizer) {
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
			if (JSTokenizer.parseJS(iconInfo.resourceBundle)) {
				var sKey = new JSTokenizer();
				if (iconInfo.resourceBundle.hasText(sKey)) {
					JSTokenizer.parseJS("coreComplete", "Core.js - complete");
					JSTokenizer.parseJS("coreBoot", "Core.js - boot");
					JSTokenizer.parseJS("coreInit", "Core.js - init");
				}
			}
		};

		return A;
	}, /* bExport= */ true);