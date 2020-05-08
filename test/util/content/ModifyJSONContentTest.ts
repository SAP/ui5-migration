import {ModifyJSONContent} from "../../../src/util/content/ModifyJSONContent";

const assert = require("assert");

describe("ModifyJSONContent", function() {
	it("Should replace i18n sections", function() {
		const strContent = `{
  "sap.app": {
\t"id": "supi.theTests",
\t"type": "application",
\t"i18n": "i18n/i18n.properties",
\t"title": "{{appTitle}}"
  },
  "sap.ui5": {
\t"models": {
\t  "i18n": {
\t\t"type": "sap.ui.model.resource.ResourceModel",
\t\t"settings": {
\t\t  "bundleName": "supi.theTests.i18n.i18n"
\t\t},
\t\t"preload": true
\t  }
\t}
  }
}
`;

		const strContentExpected = `{
  "sap.app": {
\t"id": "supi.theTests",
\t"type": "application",
\t"i18n": {
\t\t"bundleUrl": "i18n/i18n.properties",
\t\t"supportedLocales": [
\t\t\t"de",
\t\t\t"en"
\t\t],
\t\t"fallbackLocale": "de"
\t},
\t"title": "{{appTitle}}"
  },
  "sap.ui5": {
\t"models": {
\t  "i18n": {
\t\t"type": "sap.ui.model.resource.ResourceModel",
\t\t"settings": {
\t\t  "bundleName": "supi.theTests.i18n.i18n",
\t\t  "supportedLocales": [
\t\t  \t"de",
\t\t  \t"en"
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

	it("Should add settings sections", function() {
		const strContent = `{
  "sap.app": {
\t"id": "supi.theTests",
\t"type": "application",
\t"i18n": "i18n/i18n.properties",
\t"title": "{{appTitle}}"
  },
  "sap.ui5": {
\t"models": {
\t  "i18n": {
\t\t"type": "sap.ui.model.resource.ResourceModel",
\t\t"preload": true
\t  }
\t}
  }
}
`;

		const strContentExpected = `{
  "sap.app": {
\t"id": "supi.theTests",
\t"type": "application",
\t"i18n": "i18n/i18n.properties",
\t"title": "{{appTitle}}"
  },
  "sap.ui5": {
\t"models": {
\t  "i18n": {
\t\t"type": "sap.ui.model.resource.ResourceModel",
\t\t"preload": true,
\t\t"settings": {}
\t  }
\t}
  }
}
`;

		const oModifyJSONContent = ModifyJSONContent.create(strContent);

		const aPath = ["sap.ui5", "models", "i18n"];
		oModifyJSONContent.add(aPath, {
			settings: {},
		});

		assert.deepEqual(oModifyJSONContent.getContent(), strContentExpected);
	});

	it("Should replace string", function() {
		const strContent = `{
  "_version": "1.14.0",
  "start_url": "index.html",
  "myprop": "myvalue"
}
`;

		const strContentExpected = `{
  "_version": "1.21.0",
  "start_url": "index.html",
  "myprop": "myvalue"
}
`;

		const oModifyJSONContent = ModifyJSONContent.create(strContent);

		oModifyJSONContent.replace(["_version"], "1.21.0");

		assert.deepEqual(oModifyJSONContent.getContent(), strContentExpected);
	});
});
