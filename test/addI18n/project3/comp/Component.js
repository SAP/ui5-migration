
sap.ui.define('supi.testhelper.comp.Component', [
	'supi/base/Component',
	'sap/m/App'
], function(BaseComponent, App) {

	BaseComponent.extend("supi.testhelper.comp.Component", {
		metadata: {
			"manifest" : "json"
		},
		/**
		 * Initialize the application
		 * @returns {sap.ui.core.Control} the content
		 */
		init: function() {
			BaseComponent.prototype.init.apply(this, arguments);
		},
		/**
		 * Creates the application layout and returns the outer layout of APF
		 * @returns
		 */
		createContent: function() {
			BaseComponent.prototype.init.apply(this, arguments);
		}
	});
});