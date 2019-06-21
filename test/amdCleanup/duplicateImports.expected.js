sap.ui.define(["hpa/cei/mktplan/gantt/settings", "sap/ui/model/json/JSONModel"], function(oGanttSettings, JSONModel) {

	return {
		_createGanttChartControl: function() {
			if (this._oGroupConfig.aGroupBy.length === 0) {

				return new JSONModel({
					id: "ganttView",
					baseRowHeight: oGanttSettings
				});
			}
			return null;
		}
	};
});