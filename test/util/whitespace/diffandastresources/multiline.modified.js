// Expose it as a global
sap.ui.define([
    "sap/ui/core/theming/Parameters",
    "hpa/cei/mktplan/program/webapp/core/constants",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/type/Currency",
    "sap/ui/core/library",
    "sap/base/strings/formatMessage",
    "sap/base/Log"
], function(themingParameters, constants, NumberFormat, DateFormat, CurrencyFormat, library, formatMessage, Log) {
    "use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = library.ValueState;

	/**
	 * Formatter for date intervals
	 */
	var _oDateIntervalFormat = DateFormat.getInstance({
		style: "short",
		UTC: true,
		interval: true
	});

	var _oCurrencyFormatter = new CurrencyFormat({
		style: "short"
	});

	function _formatSpendsDisplayValue(iSpend, sDisplayCurrency) {
		return _oCurrencyFormatter.formatValue([iSpend, sDisplayCurrency], "string");
	}

	var _mProgramStatusState = {
		"1000": ValueState.Warning,	//inPreparation
		"2000": ValueState.Warning,	//inApproval
		"3000": ValueState.Warning,	//inRevision
		"4000": ValueState.Success,	//Released
		"5000": ValueState.None		//Closed
	};

	var _formatter = {

		_aggregateSpendsValue: function(oModel, aPaths, sProperty) {
			var fSpend = 0;
			if (aPaths && sProperty) {
				aPaths.forEach(function(sPath) {
					var oCampaign = oModel.getObject("/" + sPath);
					fSpend += parseFloat(oCampaign[sProperty]);
				}, this);
			}
			return fSpend;
		},

		aggregateCommittedSpend: function(aPaths) {
			return _formatter._aggregateSpendsValue(this.getModel(), aPaths, constants.campaignAttributes.committedSpendDisp);
		},

		aggregateSpendsValue: function(aPaths, sProperty) {
			return _formatter._aggregateSpendsValue(this.getModel(), aPaths, sProperty);
		},

		aggregateSpendsDisplayValue: function(aPaths, sProperty, sDisplayCurrency) {
			var sDisplayValue = "";
			if (sDisplayCurrency) {
				var fSpend = _formatter._aggregateSpendsValue(this.getModel(), aPaths, sProperty);
				sDisplayValue = _formatSpendsDisplayValue(fSpend, sDisplayCurrency);
			}
			return sDisplayValue;
		},

		getColorPaletteSpendChart: function(sProposedSpendDisp, sPlannedSpendDisp, aCampaignPaths) {
			var CONST_CHART = constants.spendKPIChart;
			var sDefaultColor = themingParameters.get(CONST_CHART.defaultColor);
			var sNeutralColor = themingParameters.get(CONST_CHART.neutralColor);
			var sWarningColor = themingParameters.get(CONST_CHART.spendWarningColor);
			var aColorPalette = [sNeutralColor, sNeutralColor, sNeutralColor, sNeutralColor, sNeutralColor];
			if (sProposedSpendDisp && sPlannedSpendDisp && aCampaignPaths) {
				if (parseFloat(sPlannedSpendDisp) > parseFloat(sProposedSpendDisp)) {
					aColorPalette[CONST_CHART.plannedSpendIndex] = sWarningColor;
				} else {
					aColorPalette[CONST_CHART.plannedSpendIndex] = sDefaultColor;
				}

				var iLatestEstimateSpendDisp = _formatter._aggregateSpendsValue(this.getModel(), aCampaignPaths, constants.campaignAttributes.latestEstimateSpendDisp);
				if (iLatestEstimateSpendDisp > parseFloat(sPlannedSpendDisp)) {
					aColorPalette[CONST_CHART.latestEstimateIndex] = sWarningColor;
				} else {
					aColorPalette[CONST_CHART.latestEstimateIndex] = sDefaultColor;
				}
			}
			return aColorPalette;
		},

		getSpendByMediaChartDefaultColor: function() {
			return themingParameters.get(constants.spendByMediaTypeKPIChart.defaultColor);
		},

		getMediaTypeMicroChartTitle: function(sProgramTypeProperty) {
			var sI18nPatternForTitle = this.getView().getModel("i18n").getProperty("DetailView.Chart.TotalProposedSpendByMediaType.Title");
			var sLocalizedLabelForProposedSpend = _formatter.getProgramLabel.call(this, sProgramTypeProperty);
			return formatMessage(sI18nPatternForTitle, sLocalizedLabelForProposedSpend);
		},

		getMediaTypeBarChartTitle: function(sProgramTypeProperty) {
			var sI18nPatternForTitle = this.getView().getModel("i18n").getProperty("DetailView.Chart.AllTotalProposedSpendByMediaType.Title");
			var sLocalizedLabelForProposedSpend = _formatter.getProgramLabel.call(this, sProgramTypeProperty);
			return formatMessage(sI18nPatternForTitle, sLocalizedLabelForProposedSpend);
		},

		/**
		 * Formatter for percentage values
		 * @param   {Number} iValue percent value ranging 0-100
		 * @returns {string} formatted percent value
		 */
		getPercentFormatted: function(iValue) {
			var oPercentFormat = NumberFormat.getPercentInstance({
				decimals: 0
			});
			return oPercentFormat.format(iValue / 100);
		},

		/**
		 * Formatter for displaying a budget path
		 * @param   {Object} oPlanCoordinate
		 * @param   {String} sPlanningHierarchy
		 * @param   {Object} oMetaModel
		 */
		formatBudgetPath: function(oPlanCoordinate, sPlanningHierarchy, oMetaModel) {
			if (oPlanCoordinate === undefined || sPlanningHierarchy === undefined) {
				return undefined; //premature call of formatter
			}

			var aPlanningHierarchyArray = [];
			try {
				aPlanningHierarchyArray = JSON.parse(sPlanningHierarchy);
			} catch (err) {
				Log.error("Error parsing the planning model's planning hierarchy");
			}

			var aBudgetPath = [];
			// When the budget tab is focused, the metaModel can be retrieved from the view otherwise it needs to be passed
			if (!oMetaModel) {
				oMetaModel = this.getView().getModel().getMetaModel();
			}

			//Join dimensions in correct order
			for (var iDimensionCounter = 0; iDimensionCounter < aPlanningHierarchyArray.length; iDimensionCounter++) {
				// Take the current marketing dimension ID from the planning hierarchy
				var sDimensionIdString = aPlanningHierarchyArray[iDimensionCounter];
				// Retrieve the context of the marketing dimension description attribute
				var oDimensionIdContext = oMetaModel.getMetaContext("/" + constants.planCoordinateAttributes.entitySet + "/" + sDimensionIdString);
				// And finally look up its value:
				var dimensionDescString = oDimensionIdContext.getProperty(constants.budgetAssignment.annotationPointingToDimensionDescription);
				aBudgetPath.push(oPlanCoordinate[dimensionDescString]);
			}

			// Add the year to the root dimension
			aBudgetPath[0] += " " + oPlanCoordinate.CalendarYear;

			// Render the funding source
			var sFundingSourceName;
			for (iDimensionCounter = 0; iDimensionCounter < aBudgetPath.length; iDimensionCounter++) {
				if (sFundingSourceName) {
					sFundingSourceName = this.oBundle.getText("DetailView.Budget.FundingSource.Format", [sFundingSourceName, aBudgetPath[iDimensionCounter]]);
				} else {
					sFundingSourceName = aBudgetPath[iDimensionCounter];
				}
			}

			return sFundingSourceName;
		},

		/**
		 * Return Marketing Area from plan coordinate
		 * @param   {Object} oPlanCoordinate
		 */
		getMarketingArea: function(oPlanCoordinate) {
			if (oPlanCoordinate) {
				return oPlanCoordinate[constants.planCoordinateAttributes.mktAreaDesc];
			}
			return "";
		},

		/**
		 * Get the text/label of a property of the Program entity.
		 * @param {string} sPropertyName OData entity property name in metadata.
		 * @return {string} the localized text (label) of the property
		 */
		getProgramLabel: function(sPropertyName) {
			return _formatter.getLabelFromMetadata.call(this, constants.entityNames.program, sPropertyName);
		},

		/**
		 * Get the text/label of a property of the Campaign entity.
		 * @param {string} sPropertyName OData entity property name in metadata.
		 * @return {string} the localized text (label) of the property
		 */
		getCampaignLabel: function(sPropertyName) {
			return _formatter.getLabelFromMetadata.call(this, constants.entityNames.campaign, sPropertyName);
		},

		/**
		 * Get the text/label of a property of an entity.
		 * @param {string} sPropertyName OData entity property name in metadata.
		 * @return {string} the localized text (label) of the property
		 */
		getLabelFromMetadata: function(sEntityTypeName, sProperty) {
			return this.getModel().getProperty("/#" + sEntityTypeName + "/" + sProperty + constants.odata.sapLabel);
		},

		/**
		 * Get the Campaigns Table title
		 * @param {integer} iNumberOfCampaigns
		 * @returns {string} text for 'campaigns (number of campaigns)'
		 */
		getNumberOfCampaignsText: function(iNumberOfCampaigns) {
			if (this.oBundle === null || iNumberOfCampaigns === undefined) {
				return "";
			}
			return this.oBundle.getText("MasterList.Label.Campaigns", iNumberOfCampaigns === null ? "0" : iNumberOfCampaigns.toString());
		},

		/**
		 * Get date range from 2 dates in String format
		 * @param {String} sStartDate
		 * @param {String} sEndDate
		 */
		getDateRange: function(sStartDate, sEndDate) {
			return this.oBundle.getText("Common.DateRange", [sStartDate, sEndDate]);
		},

		/**
		 * Format the campaign id for display in the table
		 * @param {string} sInput Char10 campaign id with leading zeros: 0000032356
		 * @returns {string} Campaign id in external format, leading zeros removed: 32356
		 */
		formatCampaignId: function(sInput) {
			if (sInput) {
				return parseInt(sInput, 10).toString();
			}
			return "";
		},

		/**
		 * Formats planned spend text with 2 decimals, returns "Not Defined" if amount is null
		 *
		 * @param {number} iAmount
		 * @param {string} sCurrency
		 * @param {string} sNotDefinedText
		 */
		plannedSpendText: function(iAmount, sCurrency, sNotDefinedText) {
			if (iAmount === null) {
				return sNotDefinedText;
			}
			return NumberFormat.getCurrencyInstance({
				currencyCode: true,
				decimals: 2
			}).format(iAmount, sCurrency);
		},

		/**
		 * Format remaining fund
		 * @param  {string} sPlannedBudget, planned budget
		 * @param  {string} sProposedSpend, proposed spend
		 * @return {string} formatted remaining fund
		 */
		formatRemainingFund: function(sPlannedBudget, sProposedSpend) {
			var iRemainingFund = parseFloat(sPlannedBudget) - parseFloat(sProposedSpend);
			var oNumberFormat = NumberFormat.getCurrencyInstance({
				style: "short",
				shortDecimals: 1
			});
			return oNumberFormat.format(iRemainingFund);
		},

		/**
		 * Convert UTC date to local time zone date.
		 * @param {object} Date in UTC format
		 * @return {object} Date in local time zone
		 * */
		convertFromUTCToLocalTimeZone: function(dDateUTC) {
			if (dDateUTC) {
				return new Date(dDateUTC.getTime() + dDateUTC.getTimezoneOffset() * 60 * 1000);
			}
		},

		/**
		 * Convert local date to UTC time zone date.
		 * @param {object} Date in local format
		 * @return {object} Date in UTC time zone
		 * */
		convertFromLocalToUTCTimeZone: function(dLocalDate) {
			if (dLocalDate) {
				return new Date(dLocalDate.getTime() - dLocalDate.getTimezoneOffset() * 60 * 1000);
			}
		},

		/**
		 * Format the object subtitle
		 * @fioriElements ObjectPage|Programs
		 * @param {Date} dValidFrom valid from date
		 * @param {Date} dValidTo valid to date
		 * @param {string} sMktAreaDesc marketing area description
		 * @return {string} the formatted object subtitle
		 */
		formatObjectSubtitle: function(dValidFrom, dValidTo, sMktAreaDesc) {
			var sDateInterval = (dValidFrom && dValidTo) ? _oDateIntervalFormat.format([dValidFrom, dValidTo]) : "";
			return sDateInterval ? formatMessage("{0}, {1}", sDateInterval, sMktAreaDesc) : sMktAreaDesc;
		},

		getStatusState: function(sStatusCode) {
			return sStatusCode ? _mProgramStatusState[sStatusCode] : ValueState.None;
		},

		/**
		 * Return color formatting for assing funding source numbers
		 * @param  {string} sPlannedBudget, planned budget
		 * @param  {string} sProposedSpend, proposed spend
		 * @return {string} value state
		 */
		formatPlanBudgetState: function(sPlannedBudget, sProposedSpend) {
			var fRemainingBudget = parseFloat(sPlannedBudget) - parseFloat(sProposedSpend);
			var oBindingContext = this.getView().getBindingContext();
			var fProgramProposedSpend = parseFloat(oBindingContext.getProperty(constants.programAttributes.proposedSpend));

			if (fRemainingBudget >= fProgramProposedSpend) {
				return constants.valueState.success;
			}
			return constants.valueState.error;
		},

		roundNumber: function(fNumber, iPrecision) {
			return Math.round(fNumber * Math.pow(10, iPrecision)) / Math.pow(10, iPrecision);
		},

		isButtonVisible: function(sEditActionControl) {
			return sEditActionControl !== constants.editActionControl.hidden;
		},

		isButtonEnabled: function(sEditActionControl) {
			return _formatter.isProgramEditable(sEditActionControl);
		},

		isProgramEditable: function(sEditActionControl) {
			return sEditActionControl === constants.editActionControl.enabled;
		},

		isFundingAssignmentEnabled: function(sActionControl) {
			return sActionControl === constants.assignFundActionControl.enabled;
		}

	};

	var formatter = _formatter;

	return _formatter;
}, true);