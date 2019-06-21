sap.ui.define([
	"hpa/cei/mktplan/control/fragment/FragmentDialog",
	"hpa/cei/mktplan/const",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Column",
	"sap/m/Text",
	"hpa/cei/mktplan/gantt/entity",
	"hpa/cei/mktplan/gantt/valueHelpBuilder",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/comp/filterbar/FilterBar",
	"sap/m/SearchField",
	"hpa/cei/mktplan/shim/ValueHelpDialog",
	"hpa/cei/mktplan/gantt/filter"

], function (FragmentDialog, CONST, JSONModel, TableColumn, Text, ganttEntity, valueHelpBuilder, //eslint-disable-line max-params
	Filter, FilterOperator, FilterType, FilterBar, SearchField, ValueHelpDialog, ganttFilter) {
	"use strict";

	var S_FROM_DATE = "/" + ganttFilter.S_FROM_DATE,
		S_TO_DATE = "/" + ganttFilter.S_TO_DATE,
		S_STATIC_FIELDS = "/" + ganttFilter.S_STATIC_FIELDS,
		S_DATE_RANGE_IS_VALID = "/dateRangeIsValid",
		S_DATE_RANGE = "dateRange",
		S_VALUE = "value",
		S_FIELD = "field",
		S_OBJECT = "object";

	var FilterProgramCampaignDialog = FragmentDialog.extend(CONST.namespace + ".control.dialog.FilterProgramCampaignDialog", {

		_sDialogId: "filterProgramCampaignDialog",
		_oMarketingPlan: null,
		_oDefaultFilters: {},
		_oInitialFilters: null,

		getFragmentName: function () {
			return CONST.namespace + ".fragment.dialog.FilterProgramCampaignDialog";
		},

		init: function () {
			// Call parent class
			FragmentDialog.prototype.init.apply(this, arguments);
			this._hardReset();
		},

		exit: function () {
			this._destroyValueHelpDialog();
			FragmentDialog.prototype.exit.apply(this, arguments);
		},

		_hardReset: function () {
			this.initControlViewModel(jQuery.extend({
				busy: false,
				busyDelay: 0,
				dateRangeIsValid: true
			}, this._oDefaultFilters));
		},

		open: function (oMarketingPlan, oFilterData) {
			this._oMarketingPlan = oMarketingPlan;
			this._oDefaultFilters = ganttFilter.init(oMarketingPlan);
			this._oInitialFilters = jQuery.extend({}, oFilterData);
			return FragmentDialog.prototype.open.call(this);
		},

		_getMinDate: function () {
			return this._oDefaultFilters[ganttFilter.S_MIN_DATE];
		},

		_getMaxDate: function () {
			return this._oDefaultFilters[ganttFilter.S_MAX_DATE];
		},

		_reset: function () {
			this._hardReset();
			this.byId(S_DATE_RANGE).setValue(""); // Clears the value
			this.setControlViewModelProperty(S_FROM_DATE, this._oInitialFilters[ganttFilter.S_FROM_DATE] || this._getMinDate());
			this.setControlViewModelProperty(S_TO_DATE, this._oInitialFilters[ganttFilter.S_TO_DATE] || this._getMaxDate());
			this.setControlViewModelProperty(S_STATIC_FIELDS, this._oInitialFilters[ganttFilter.S_STATIC_FIELDS] || []);
		},

		_beforeOpen: function () {
			this._reset();
			return Promise.resolve();
		},

		onDateRangeChanged: function (oEvent) {
			this.setControlViewModelProperty(S_DATE_RANGE_IS_VALID, oEvent.getParameter("valid"));
		},

		onResetDateRange: function () {
			this.byId(S_DATE_RANGE).setValue(""); // Clears the value
			this.setControlViewModelProperty(S_FROM_DATE, this._getMinDate());
			this.setControlViewModelProperty(S_TO_DATE, this._getMaxDate());
			this.setControlViewModelProperty(S_DATE_RANGE_IS_VALID, true);
		},

		//region Value Help dialog

		_oValueHelpDialog: null,
		_oValueHelpTable: null,
		_oValueHelpFilterBar: null,
		_oValueHelpFilterBasicSearch: null,

		_addValueHelpDialogColumn: function (oTable, sField) {
			var sCapitalizedField = jQuery.sap.charToUpperCase(sField);
			oTable.addColumn(new TableColumn({
				filterProperty: sField,
				sortProperty: sField,
				label: new Text({
					text: "{i18n>FilterProgramCampaignDialog.ValueHelp.Column." + sCapitalizedField + "}"
				}),
				template: new Text({
					text: "{data>" + sField + "}"
				})
			}));
		},

		_setValueHelpDialogTable: function () {
			var oTable = this._oValueHelpDialog.getTable();
			this._oValueHelpTable = oTable;
			[S_VALUE, S_FIELD, S_OBJECT].forEach(function (sField) {
				this._addValueHelpDialogColumn(oTable, sField);
			}, this);
			oTable.bindAggregation("rows", {
				path: "data>/records"
			});
			// Needed to refresh the table selection
			oTable.attachEvent("filter", this.onValueHelpDialogUpdate, this);
			oTable.attachEvent("sort", this.onValueHelpDialogUpdate, this);
			oTable.setEnableCellFilter(true);
		},

		_addValueHelpFilterBar: function () {
			var oFilterBar = new FilterBar({
				showFilterConfiguration: false,
				advancedMode: true,
				useToolbar: true
			});
			this._oValueHelpFilterBar = oFilterBar;
			var oSearchField = new SearchField({
				id: "basicSearch",
				showSearchButton: false
			});
			oSearchField.attachEvent("search", this.onValueHelpSearch, this); // Pressing Enter *in* the field
			this._oValueHelpFilterBasicSearch = oSearchField;
			oFilterBar.setBasicSearch(oSearchField);
			this._oValueHelpDialog.setFilterBar(oFilterBar);
			oFilterBar.attachEvent("search", this.onValueHelpSearch, this); // GO button in the filter bar
		},

		_buildValueHelpDialog: function () {
			if (!this._oValueHelpDialog) {
				var oValueHelpDialog = new ValueHelpDialog("filterProgramCampaignValueHelp", {
					title: "{i18n>FilterProgramCampaignDialog.ValueHelp.Title.StaticFields}",
					key: "key",
					descriptionKey: "token",
					tokenDisplayBehaviour: sap.ui.comp.smartfilterbar.DisplayBehaviour.descriptionOnly
				});
				this._oValueHelpDialog = oValueHelpDialog;
				this.addDependent(this._oValueHelpDialog);
				this._setValueHelpDialogTable();
				this._addValueHelpFilterBar();
				this._oValueHelpDialog.attachEvent("ok", this.onValueHelpOk, this);
				this._oValueHelpDialog.attachEvent("cancel", this.onValueHelpCancel, this);
			}
		},

		onValueHelpSearch: function () {
			var sBasicSearchValue = this._oValueHelpFilterBar.getBasicSearchValue(),
				oBinding = this._oValueHelpTable.getBinding("rows");
			// Use FilterType.Application as dialog's table will alter FilterType.Control ones
			if (sBasicSearchValue) {

				var fnTest = function (vValue) {
					// ensure a string value here, could be e.g. boolean
					var sValue = vValue + "";
					// test value
					return sValue.trim().toLowerCase().indexOf(sBasicSearchValue.trim().toLowerCase()) > -1;
				};

				oBinding.filter(new Filter({
					filters: [
						new Filter(S_VALUE, fnTest),
						new Filter(S_FIELD, fnTest),
						new Filter(S_OBJECT, fnTest)
					],
					and: false
				}), FilterType.Application);
			} else {
				oBinding.filter(null, FilterType.Application);
			}
			this.onValueHelpDialogUpdate();
		},

		onValueHelpDialogUpdate: function () {
			// Need to defer the call because the table refresh is asynchronous
			jQuery.sap.delayedCall(1, this._oValueHelpDialog, "update");
		},

		onValueHelpOk: function (oEvent) {
			this.setControlViewModelProperty(S_STATIC_FIELDS, oEvent.getParameter("tokens").map(ganttFilter.createStaticFieldItemFromToken));
			this.onValueHelpCancel();
		},

		onValueHelpCancel: function () {
			this._oValueHelpDialog.close();
			this._destroyValueHelpDialog();
		},

		_destroyValueHelpDialog: function () {
			if (this._oValueHelpDialog) {
				this._oValueHelpDialog.destroy();
				delete this._oValueHelpDialog;
			}
		},

		//endregion

		onValueHelp: function () {
			var that = this;
			if (!that.getControlViewModelProperty(S_DATE_RANGE_IS_VALID)) {
				return false; // Can't approve
			}
			that.setControlViewModelProperty("/busy", true);
			that._buildValueHelpDialog();
			var oModel = that.getModel(),
				sMarketingPlanKey = oModel.createKey(CONST.OData.entityNames.marketingPlanSet, this._oMarketingPlan),
				sGantDataPath = "/" + sMarketingPlanKey + "/" + CONST.OData.navProperties.marketingPlan.toGanttData;
			oModel.promisified.read(sGantDataPath, {
					urlParameters: {
						"$select": valueHelpBuilder.getFieldNames().join(",")
					},
					filters: ganttFilter.build(this.getControlViewModelProperty("/"), /*bDateRangeOnly*/ true)
				})
				.then(function (oGanttData) {
					return valueHelpBuilder.consolidate(oGanttData)
						.sort(function (oRecord1, oRecord2) {
							// First campaign ones, sorted by field name and values then program ones
							if (oRecord1.object !== oRecord2.object) {
								if (oRecord1.from === ganttEntity.FROM_PROGRAM) {
									return 1;
								}
								return -1;
							}
							if (oRecord1.field !== oRecord2.field) {
								return oRecord1.field.localeCompare(oRecord2.field);
							}
							return oRecord1.value.toString().localeCompare(oRecord2.value);
						});
				})
				.then(function (aRecords) {
					that._oValueHelpDialog.setModel(new JSONModel({
						records: aRecords
					}), "data");
					that._oValueHelpDialog.setTokens(that.getControlViewModelProperty(S_STATIC_FIELDS).map(ganttFilter.createTokenFromStaticFieldItem));
					that._oValueHelpDialog.update();
					that.setControlViewModelProperty("/busy", false);
					that._oValueHelpDialog.open();
				});
		},

		onTokensUpdated: function (oEvent) {
			var aRemovedTokens = oEvent.getParameter("removedTokens");
			if (aRemovedTokens.length) {
				this.setControlViewModelProperty(S_STATIC_FIELDS, this.byId("staticFields").getTokens()
					.filter(function (oToken) {
						return aRemovedTokens.indexOf(oToken) === -1;
					})
					.map(ganttFilter.createStaticFieldItemFromToken));
			}
		},

		onOk: function () {
			if (!this.getControlViewModelProperty(S_DATE_RANGE_IS_VALID)) {
				return; // Can't approve
			}
			this.setDialogResult(ganttFilter.finalize(this._oInitialFilters, this.getControlViewModelData()));
			this.close();
		},

		onReset: function () {
			this._hardReset();
			this.onResetDateRange();
		},

		onClose: FragmentDialog.prototype.close

	});

	FilterProgramCampaignDialog.create = FragmentDialog.create.bind(null, FilterProgramCampaignDialog);

	return FilterProgramCampaignDialog;

});
