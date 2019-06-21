sap.ui.define([
    "hpa/cei/mktplan/const",
    "sap/m/Button",
    "sap/m/ButtonRenderer",
    "sap/m/ResponsivePopover",
    "sap/m/VBox",
    "sap/m/library"
], function(CONST, Button, ButtonRenderer, ResponsivePopover, VBox, library) {
    "use strict";

	// shortcut for sap.m.FlexAlignItems
	var FlexAlignItems = library.FlexAlignItems;

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	//region constants

	var S_ICON = "sap-icon://action";
	var S_POPOVER_ID = "popover";
	var S_LAYOUT_ID = "layout";

	//endregion

	/**
	 * Share button
	 *
	 * @public
	 * @extends sap.m.Button
	 */
	var ShareButton = Button.extend(CONST.namespace + ".control.share.ShareButton", {

		renderer: ButtonRenderer,

		metadata: {

			aggregations: {
				actions: "sap.m.Button"
			},

			defaultAggregation: "actions"
		},

		_oPopover: null,

		//region lifecycle methods

		init: function () {
			if (typeof Button.prototype.init === "function") {
				Button.prototype.init.apply(this, arguments);
			}
			this.setIcon(S_ICON);
			this.bindProperty("tooltip", {
				model: "i18n",
				path: "ShareButton.tooltip"
			});
			this.attachPress(this._onPress, this);
		},

		exit: function () {
			if (typeof Button.prototype.exit === "function") {
				Button.prototype.exit.apply(this, arguments);
			}
			this.detachPress(this._onPress, this);
		},

		//endregion

		//region event handlers

		_onPress: function () {
			this._openPopover();
		},

		//endregion

		//region private methods

		_openPopover: function () {
			if (!this._oPopover) {
				this._oPopover = this._createPopover();
				this.addDependent(this._oPopover);
			}
			this._oPopover.openBy(this);
		},

		_createPopover: function () {
			var sPopoverId = this.getId() + "-" + S_POPOVER_ID;
			var sLayoutId = sPopoverId + "-" + S_LAYOUT_ID;
			return new ResponsivePopover(sPopoverId, {
				placement: PlacementType.VerticalPreferredTop,
				showHeader: false,
				content: new VBox(sLayoutId, {
					alignItems: FlexAlignItems.Start,
					items: this.getActions().map(function (oButton) {
						oButton.setType(ButtonType.Transparent);
						return oButton;
					})
				})
			});
		}

		//endregion

	});

	return ShareButton;
});