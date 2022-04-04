const assert = require("assert");
const fs = require("graceful-fs");
const path = require("path");

const rootDir = "./";
const jsDir = rootDir + "js/src/";

interface ConfigObject {
	modules: {
		[index: string]: {
			[index: string]: {
				replacer: string;
				finder: string;
				extender: string;
			};
		};
	};
	extenders: {[index: string]: string};
	finders: {[index: string]: string};
	replacers: {[index: string]: string};
}

const parseConfig = function (sConfigFile: string): Promise<ConfigObject> {
	const sNormalizedConfigFile = path.normalize(
		rootDir + "defaultConfig/" + sConfigFile
	);
	return new Promise((resolve, reject) => {
		fs.readFile(
			sNormalizedConfigFile,
			"utf8",
			(err: string, data: string) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(JSON.parse(data));
			}
		);
	});
};

describe("Config validation", () => {
	it("should validate the config replaceGlobals", () => {
		// load config

		// check existence of each replacer
		// check existence of each replacer file
		const sConfigFile = "replaceGlobals.config.json";
		return parseConfig(sConfigFile).then((oJsonObj: ConfigObject) => {
			Object.keys(oJsonObj.modules).forEach((sKey: string) => {
				const oModule = oJsonObj.modules[sKey];
				Object.keys(oModule).forEach((sModuleKey: string) => {
					const sReplacer = oModule[sModuleKey].replacer;
					if (sReplacer) {
						let sReplacerFile = oJsonObj.replacers[sReplacer];
						assert.ok(
							sReplacerFile,
							"Replacer " + sReplacer + " exists"
						);
						sReplacerFile = path.normalize(jsDir + sReplacerFile);
						assert.ok(
							fs.existsSync(sReplacerFile),
							"File " + sReplacerFile + " exists"
						);
					}
				});
			});
		});
	});

	it("should validate the config addMissingDependencies", () => {
		// load config

		// check existence of each replacer
		// check existence of each replacer file
		const sConfigFile = "addMissingDependencies.config.json";
		return parseConfig(sConfigFile).then(oJsonObj => {
			Object.keys(oJsonObj.modules).forEach((sKey: string) => {
				const oModule = oJsonObj.modules[sKey];
				Object.keys(oModule).forEach((sModuleKey: string) => {
					const sReplacer = oModule[sModuleKey].replacer;
					if (sReplacer) {
						const sReplacerFile = oJsonObj.replacers[sReplacer];
						assert.ok(
							sReplacerFile,
							"Replacer " + sReplacer + " exists"
						);
						const sNormalizedReplacerFile = path.normalize(
							jsDir + sReplacerFile
						);
						assert.ok(
							fs.existsSync(sNormalizedReplacerFile),
							"File " + sNormalizedReplacerFile + " exists"
						);
					}

					const sFinder = oModule[sModuleKey].finder;
					if (sFinder) {
						const sFinderFile = oJsonObj.finders[sFinder];
						assert.ok(sFinderFile, "Finder " + sFinder + " exists");
						const sNormalizedFinderFile = path.normalize(
							jsDir + sFinderFile
						);
						assert.ok(
							fs.existsSync(sNormalizedFinderFile),
							"File " + sNormalizedFinderFile + " exists"
						);
					}

					const sExtender = oModule[sModuleKey].extender;
					if (sExtender) {
						const sExtenderFile = oJsonObj.extenders[sExtender];
						assert.ok(
							sExtenderFile,
							"Finder " + sExtender + " exists"
						);
						const sNormalizedExtenderFile = path.normalize(
							jsDir + sExtenderFile
						);
						assert.ok(
							fs.existsSync(sNormalizedExtenderFile),
							"File " + sNormalizedExtenderFile + " exists"
						);
					}
				});
			});
		});
	});
});
