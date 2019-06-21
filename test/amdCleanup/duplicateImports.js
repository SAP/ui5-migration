sap.ui.define([
	"hpa/cei/mktplan/gantt/settings",
	"my/unused/dependency",
	"hpa/cei/mktplan/gantt/settings"
], function (ganttSettings, dependency, oGanttSettings) {

	return {
		_createGanttChartControl: function() {
			if (this._oGroupConfig.aGroupBy.length === 0) {

				return new sap.ui.model.json.JSONModel({
					id: "ganttView",
					baseRowHeight: oGanttSettings
				});
			}
			return null;
		}
	};
});
