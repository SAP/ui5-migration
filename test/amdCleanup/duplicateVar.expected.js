sap.ui.define(["mynamespace/s1/controller/BaseController",
	"mynamespace/s1/utils/DataRequestManager",
	"mynamespace/s1/utils/DataRequestManager"],
function(BaseController, DataRequestManager, oDataRequestManager) {
	return BaseController.extend("mynamespace.s1.controller.AnalyticsObjectList", {

		_getHeaderCount : function() {
			var oODataModel = this.getOwnerComponent().getModel();
			var fSuccessHandler = jQuery.proxy(this._setKPICount, this);
			var fErrorHandler = jQuery.proxy(function(errorResponse) {
				errorResponse();
			}, this);
			DataRequestManager.fetchAvailableKPICount(oODataModel, fSuccessHandler, fErrorHandler);
		}
	});
});