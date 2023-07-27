![UI5 logo](./docs/images/UI5_logo_wide.png)

# Migrate API Calls of sap/ui/core/Core.js with new APIs

## Preparation

- Change the value of "OPENUI5_HOME" in ".env" file to the absolute path of the local root folder of openui5 project

- `npm install`

- `npm run build`

- `npm link`

- Go to your openui5 project folder and run `npm link @ui5/migration`

## Execution

- Run the command below in your openui5 project to migrate the existing API Calls of sap/ui/core/Core.js
```cli
ui5-migration migrate src/sap.m/src --task fix-jquery-plugin-imports
```

