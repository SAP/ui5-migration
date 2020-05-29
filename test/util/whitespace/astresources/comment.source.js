jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.core.routing.History");
jQuery.sap.require("sap.m.routing.RouteMatchedHandler");

// define a root UI component that exposes the main view
jQuery.sap.declare("sap.mods.Component");

sap.ui.core.UIComponent
	.extend(
		"sap.mods.Component", {
			metadata: {
				manifest: "json",
				"name": "SAP Mods",
				"version": "1.1.0-SNAPSHOT",
				"library": "sap.mods",
				"includes": ["css/style.css"],
				// "includes": ["css/fullScreenStyles.css"],
				"dependencies": {
					"libs": ["sap.m", "sap.ui.layout", "sap.viz",
						"sap.ui.unified"
					],
					"components": []
				},
				"config": {
					compactContentDensity: true,
					cozyContentDensity: false,
					favIcon: "images/favicon.ico",
					serviceConfig: {
						name: "telco",
						serviceUrl: ""
					},
					fullWidth: true
				},
				routing: {
					// The default values for routes
					config: {
						"viewType": "XML",
						"viewPath": "sap.mods.view"
					},
					routes: [{
						pattern: "",
						name: "main",
						view: "Main"
					}]
				}
			},

			/**
			 * Initialize the application
			 *
			 * @returns {sap.ui.core.Control} the content
			 */
			createContent: function () {
				var oViewData = {
					component: this
				};

				return sap.ui
					.view({
						viewName: "sap.mods.view.App",
						type: sap.ui.core.mvc.ViewType.XML,
						viewData: oViewData
					});
			},

			init: function () {
				// call super init (will call function "create content")
				sap.ui.core.UIComponent.prototype.init.apply(this,
					arguments);

				this._routeMatchedHandler = new sap.m.routing.RouteMatchedHandler(
					this.getRouter(), this._bRouterCloseDialogs);

				// initialize router and navigate to the first page
				this.getRouter().initialize();
			},

			exit: function () {
				this._routeMatchedHandler.destroy();
			}
		});
