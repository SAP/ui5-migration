![UI5 logo](./docs/images/UI5_logo_wide.png)

# Migrate API Calls of sap/ui/core/Core.js with new APIs

## Preparation

- Change the value of "OPENUI5_HOME" in ".env" file to the absolute path of the local root folder of openui5 project

- `npm install`

- `npm run build`

- `npm link`

- Go to your openui5 project folder and run `npm link @ui5/migration`

- Run the command below in your openui5 project to migrate the existing API Calls of sap/ui/core/Core.js
```cli
ui5-migration migrate src/sap.m/src src/sap.ui.core/src/sap/ui/core/delegate/ItemNavigation.js src/sap.ui.core/src/sap/ui/core/delegate/ScrollEnablement.js src/sap.ui.core/src/sap/ui/core/InvisibleMessage.js src/sap.ui.core/src/sap/ui/core/InvisibleText.js src/sap.ui.core/src/sap/ui/core/AccessKeysEnablement.js --task fix-jquery-plugin-imports
```

## Manual Steps

- Add a probing require to get the sap/ui/core/Element class in sap/ui/core/RenderManager and replace the [Core.byId()](https://github.com/SAP/openui5/blob/master/src/sap.ui.core/src/sap/ui/core/RenderManager.js#L2352) with `Element.registry.get()`

- Add a eager dependency to `sap/ui/events/jquery/EventSimulation` in `sap/ui/core/CoreX.js`
