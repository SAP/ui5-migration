import {ModifyJSONContent} from "../../../src/util/content/ModifyJSONContent";

const assert = require("assert");

describe("ModifyJSONContent", function() {
	it("Should succeed if valid version range was given", function() {
		const strContent = `{
  "sap.app": {
\t"id": "sap.f.cardsVisualTests",
\t"type": "application",
\t"i18n": "i18n/i18n.properties",
\t"title": "{{appTitle}}"
  },
  "sap.ui5": {
\t"models": {
\t  "i18n": {
\t\t"type": "sap.ui.model.resource.ResourceModel",
\t\t"settings": {
\t\t  "bundleName": "sap.f.cardsVisualTests.i18n.i18n"
\t\t},
\t\t"preload": true
\t  }
\t}
  }
}
`;

		const strContentExpected = `{
  "sap.app": {
\t"id": "sap.f.cardsVisualTests",
\t"type": "application",
\t"i18n": {
\t  "bundleUrl": "i18n/i18n.properties",
\t  "supportedLocales": [
\t    "de",
\t    "en"
\t  ],
\t  "fallbackLocale": "de"
\t},
\t"title": "{{appTitle}}"
  },
  "sap.ui5": {
\t"models": {
\t  "i18n": {
\t\t"type": "sap.ui.model.resource.ResourceModel",
\t\t"settings": {
\t\t  "bundleName": "sap.f.cardsVisualTests.i18n.i18n",
\t\t  "supportedLocales": [
\t\t    "de",
\t\t    "en"
\t\t  ],
\t\t  "fallbackLocale": "de"
\t\t},
\t\t"preload": true
\t  }
\t}
  }
}
`;

		const oModifyJSONContent = ModifyJSONContent.create(strContent);
		//const oConfig = oModifyJSONContent.find(["sap.ui5"]["models"]["i18n"]);

		oModifyJSONContent.replace(["sap.app", "i18n"], {
			bundleUrl: "i18n/i18n.properties",
			supportedLocales: ["de", "en"],
			fallbackLocale: "de",
		});

		const aPath = ["sap.ui5", "models", "i18n", "settings"];
		oModifyJSONContent.add(aPath, {
			supportedLocales: ["de", "en"],
			fallbackLocale: "de",
		});

		assert.deepEqual(oModifyJSONContent.getContent(), strContentExpected);
	});
});
