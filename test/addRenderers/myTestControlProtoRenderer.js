/* !
 * ${copyright}
 */

// Provides control sap.m.MyTestControl.
sap.ui.define(["sap/ui/core/Control"],
	function(Control) {
		"use strict";

		/**
		 * Constructor for a new <code>MyTestControl</code>.
		 *
		 */
		var MyTestControl = Control.extend("test.MyTestControl", /** @lends test.MyTestControl.prototype */ {
			metadata: {

				interfaces: ["sap.ui.core.IFormContent"],
				library: "test",
				properties: {

					/**
					 * Determines the text of the <code>MyTestControl</code>.
					 */
					text: {type: "string", group: "Misc", defaultValue: null}

				},
				associations: {

					/**
					 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
					 */
					ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"}
				},
				events: {

					/**
					 * Fired when the user taps the control.
					 * @deprecated As of version 1.20, use the press event instead
					 */
					tap: {deprecated: true},

					/**
					 * Fired when the user clicks or taps on the control.
					 */
					press: {}
				},
				designTime: true
			}
		});

		/**
		 * Function is called when exiting the control.
		 *
		 * @private
		 */
		MyTestControl.prototype.exit = function() {
			// destroy image controls if initialized
			if (this._image) {
				this._image.destroy();
			}

			if (this._iconBtn) {
				this._iconBtn.destroy();
			}
		};

		/*
		 * Remember active state if the MyTestControl was depressed before re-rendering.
		 */
		MyTestControl.prototype.onBeforeRendering = function() {
			this._bRenderActive = this._bActive;
		};

		/*
		 * Restore active state if the MyTestControl was depressed before re-rendering.
		 * Save _bRenderActive to treate the next mouseup as a tap event.
		 */
		MyTestControl.prototype.onAfterRendering = function() {
			if (this._bRenderActive) {
				this._activeMyTestControl();
				// now, this._bActive may be false if the MyTestControl was disabled
				this._bRenderActive = this._bActive;
			}
		};

		MyTestControl.prototype.prototype.render = function(rm) {
			rm.write("<ul>");

			rm.write("</ul>");
		};

		return MyTestControl;
	}, /* bExport= */ true);
