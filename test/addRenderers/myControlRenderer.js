/*!
 * ${copyright}
 */

sap.ui.define([],

	function() {
		"use strict";


		/**
		 * myControl renderer.
		 * @namespace
		 */
		var myControlRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided
		 * {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm
		 *            the RenderManager that can be used for writing to
		 *            the Render-Output-Buffer
		 * @param {sap.ui.core.Control} myControl
		 *            the button to be rendered
		 */
		myControlRenderer.render = function(oRm, myControl) {



			// start myControl tag
			oRm.write("<mine");
			oRm.writeControlData(myControl);
			oRm.addClass("xClass");
			oRm.write(">");


			// end myControl tag
			oRm.write("</mine>");
		};


		return myControlRenderer;

	}, /* bExport= */ true);