// define a root UI component that exposes the main view
sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/core/routing/History", "sap/m/routing/RouteMatchedHandler", "sap/ui/core/library"], function(UIComponent, RoutingHistory, RouteMatchedHandler, coreLibrary) {
		"use strict";

		var component = coreLibrary.UIComponent
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
								type: coreLibrary.mvc.ViewType.XML,
								viewData: oViewData
							});
					},

					init: function () {
						// call super init (will call function "create content")
						coreLibrary.UIComponent.prototype.init.apply(this,
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

		return component;
	}, true);
