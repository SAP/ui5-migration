/* tslint:disable:no-console */

"use strict";

import {Reporter, ReportLevel} from "../reporter/Reporter";
import * as LoaderUtils from "../util/LoaderUtils";
import {ConsoleReporter} from "../reporter/ConsoleReporter";

interface MetaObject {
	defaultAggregation: {};
}

interface LibraryInfo {
	name: string;
}

interface VersionInfo {
	libraries: LibraryInfo[];
}

interface APIInfoOptions {
	mApi: object;
	mApiIncludedResources: object;
	oApiVersion: VersionInfo;
	rootPath: string;
	targetVersion: string;
	reporter: Reporter;
}

interface LibDocSymbolObject {
	module: string;
	name: string;
	static: boolean;
}

interface LibDocSymbol {
	name?: string;
	symbol?: LibDocSymbol;
	member?: LibDocSymbolObject;
	module?: string;
	kind?: string;
	export?: string | undefined;
	properties?: LibDocSymbolObject[];
	methods?: LibDocSymbolObject[];
	visibility?: string;
	extends?: string;
	"ui5-metadata"?: MetaObject;
}

interface LibDoc {
	symbols: LibDocSymbol[];
}

const EMPTY_LIB_DOC: LibDoc = {
	symbols: [],
};

/**
 * Provides API info with a given JSON
 */
export class APIInfo {
	private oLibraryDocumentation: {[index: string]: LibDoc};
	private oApiVersion: VersionInfo;
	private mApi: object;
	private mApiIncludedResources: object;
	private rootPath: string;
	private reporter: Reporter = new ConsoleReporter(ReportLevel.INFO);
	private mEntityToSymbol: Map<string, Promise<LibDocSymbol>>;

	constructor(oOptions: APIInfoOptions) {
		/**
		 * Cached content of api.json files per library.
		 */
		this.oLibraryDocumentation = {};
		/**
		 * Root path to read api.json files from
		 */
		let sRoot = oOptions.rootPath || "./";
		if (sRoot.slice(-1) !== "/") {
			sRoot += "/";
		}
		if (oOptions.targetVersion && oOptions.targetVersion !== "latest") {
			sRoot += oOptions.targetVersion + "/";
		}

		this.rootPath = sRoot;
		this.mApi = oOptions.mApi;
		this.mApiIncludedResources = oOptions.mApiIncludedResources;
		this.oApiVersion = oOptions.oApiVersion;
		this.reporter = oOptions.reporter;
	}

	async loadJSON(rootPath: string, resource: string): Promise<{}> {
		this.reporter.report(
			ReportLevel.TRACE,
			"Loading resource " + rootPath + resource
		);
		return LoaderUtils.fetchResource(rootPath + resource);
	}

	static findLibraryName(
		sEntityName: string,
		oVersionInfo: VersionInfo | undefined
	): string {
		if (oVersionInfo && Array.isArray(oVersionInfo.libraries)) {
			for (let i = 0; i < oVersionInfo.libraries.length; i++) {
				const library = oVersionInfo.libraries[i];
				if (
					sEntityName === library.name ||
					sEntityName.indexOf(library.name + ".") === 0
				) {
					return library.name;
				}
			}
		}
		// use sap.ui.core library for all non-matching elements, e.g.
		// sap.ui.model.Filter
		// TODO use api-index.json to find library of entity
		// (/docs/api/api-index.json)
		return sEntityName.startsWith("sap.ui.") ? "sap.ui.core" : undefined;
	}

	async findLibrary(sEntityName: string): Promise<string> {
		// TODO resolve this o0
		if (this.oApiVersion && Object.keys(this.oApiVersion).length > 0) {
			return Promise.resolve(
				APIInfo.findLibraryName(sEntityName, this.oApiVersion)
			);
		} else if (this.rootPath) {
			return this.loadJSON(
				this.rootPath,
				"resources/sap-ui-version.json"
			).then(
				(oObject: {}) => {
					this.oApiVersion = oObject as VersionInfo;
					return APIInfo.findLibraryName(
						sEntityName,
						this.oApiVersion
					);
				},
				() => {
					return "sap.ui.core";
				}
			);
		} else {
			// fallback to core (this ensures that the extraordinary packages of
			// sap.ui.core are found, but doesn't work as soon as other libs do
			// the same)
			return Promise.resolve("sap.ui.core");
		}
	}

	postProcessAPIJSON(oLibDoc: LibDoc, reporter: Reporter): LibDoc {
		const modules: {[index: string]: LibDocSymbol[]} = {};
		let symbols = oLibDoc.symbols;
		let i;
		let j;
		let n;

		// collect modules and their exports
		for (i = 0; i < symbols.length; i++) {
			const moduleSymbolName = symbols[i].module;
			if (moduleSymbolName) {
				modules[moduleSymbolName] = modules[moduleSymbolName] || [];
				modules[moduleSymbolName].push({
					name: symbols[i].name,
					symbol: symbols[i],
				});
			}
			const props = symbols[i].properties;
			if (props) {
				for (j = 0; j < props.length; j++) {
					if (props[j].static && props[j].module) {
						modules[props[j].module] =
							modules[props[j].module] || [];
						modules[props[j].module].push({
							name: symbols[i].name + "." + props[j].name,
							symbol: props[j],
						});
					}
				}
			}
			const meths = symbols[i].methods;
			if (meths) {
				for (j = 0; j < meths.length; j++) {
					if (meths[j].static && meths[j].module) {
						modules[meths[j].module] =
							modules[meths[j].module] || [];
						modules[meths[j].module].push({
							name: symbols[i].name + "." + meths[j].name,
							symbol: meths[j],
						});
					}
				}
			}
		}

		/**
		 * recursive
		 * @param defaultExport
		 * @param symbol
		 */
		function guessExport(defaultExport: string, symbol: LibDocSymbol) {
			if (symbol.name === defaultExport) {
				// default export equals the symbol name
				symbol.symbol.export = "";
				// reporter.report(ReportLevel.TRACE,"    (default):" +
				// defaultExport);
			} else if (symbol.name.lastIndexOf(defaultExport + ".", 0) === 0) {
				// default export is a prefix of the symbol name
				symbol.symbol.export = symbol.name.slice(
					defaultExport.length + 1
				);
				// reporter.report(ReportLevel.TRACE,"    " +
				// symbol.name.slice(defaultExport.length + 1) + ":" +
				// symbol.name);
			} else {
				// default export is not a prefix of the symbol name -> no way
				// to access it in AMD
				symbol.symbol.export = undefined;
				reporter.report(
					ReportLevel.TRACE,
					"    **** could not identify module export for API " +
						symbol.name
				);
			}
		}

		let defaultExport: string;
		for (n in modules) {
			if (Object.prototype.hasOwnProperty.call(modules, n)) {
				symbols = modules[n].sort((a, b) => {
					if (a.name === b.name) {
						return 0;
					}
					return a.name < b.name ? -1 : 1;
				});

				// reporter.report(ReportLevel.TRACE,'  resolved exports of ' +
				// n + ": "
				// + symbols.map(function(symbol) { return symbol.name; } ));
				if (/^jquery\.sap\./.test(n)) {
					// the jquery.sap.* modules all export 'jQuery'.
					// any API from those modules is reachable via 'jQuery.*'
					defaultExport = "jQuery";
					symbols.forEach(guessExport.bind(null, defaultExport));
				} else if (/\/library$/.test(n)) {
					// library.js modules export the library namespace
					defaultExport = n
						.replace(/\/library$/, "")
						.replace(/\//g, ".");
					if (
						symbols.some(symbol => {
							return symbol.name === defaultExport;
						})
					) {
						// if there is a symbol for the namespace,
						// then all other symbols from the module should be
						// sub-exports of that symbol
						symbols.forEach(guessExport.bind(null, defaultExport));
					} else {
						// otherwise, we don't know how to map it to an export
						symbols.forEach(symbol => {
							symbol.symbol.export = symbol.name;
							reporter.report(
								ReportLevel.TRACE,
								"    **** unresolved " +
									symbol.name +
									" in library.js (no export that matches module name)"
							);
						});
					}
				} else {
					// for all other modules, the assumed default export is
					// identical to the name of the module (converted to a 'dot'
					// name)
					defaultExport = n.replace(/\//g, ".");
					if (
						symbols.some(symbol => {
							return symbol.name === defaultExport;
						})
					) {
						symbols.forEach(guessExport.bind(null, defaultExport));
						// } else if ( symbols.length === 1 &&
						// (symbols[0].symbol.kind === 'class' ||
						// symbols[0].symbol.kind === 'namespace') ) { if there
						// is only one symbol and if that symbol is of type
						// class or namespace, assume it is the default export
						// TODO is that assumption safe? Was only done because
						// of IBarPageEnabler
						// TODO (which maybe better should be fixed in the
						// JSDoc) symbols[0].symbol.export = '';
					} else {
						symbols.forEach(symbol => {
							symbol.symbol.export = undefined;
							reporter.report(
								ReportLevel.TRACE,
								"    **** unresolved " +
									symbol.name +
									" (no export that matches module name)"
							);
						});
					}
				}
			}
		}
		return oLibDoc;
	}

	findModule(moduleName: string, oLibDoc: LibDoc) {
		const globalName = moduleName.replace(/\.js$/, "").replace(/\//g, ".");
		const symbols = oLibDoc.symbols;
		for (let i = 0; i < symbols.length; i++) {
			const symbol = symbols[i];
			if (symbol.name === globalName) {
				return symbol;
			}
		}
		return undefined;
	}

	findSymbol(oLibDoc: LibDoc, sEntityName: string): LibDocSymbol | undefined {
		if (!oLibDoc || oLibDoc === EMPTY_LIB_DOC) {
			return undefined;
		}

		const symbols = oLibDoc.symbols;
		if (Array.isArray(symbols)) {
			let i;
			let j;
			for (i = 0; i < symbols.length; i++) {
				if (symbols[i].name === sEntityName) {
					return {symbol: symbols[i]};
				}
				if (sEntityName.indexOf(symbols[i].name + ".") === 0) {
					if (symbols[i].properties) {
						for (j = 0; j < symbols[i].properties.length; j++) {
							if (
								symbols[i].properties[j].static &&
								sEntityName ===
									symbols[i].name +
										"." +
										symbols[i].properties[j].name
							) {
								return {
									symbol: symbols[i],
									member: symbols[i].properties[j],
								};
							}
						}
					}
					if (symbols[i].methods) {
						for (j = 0; j < symbols[i].methods.length; j++) {
							if (
								symbols[i].methods[j].static &&
								sEntityName ===
									symbols[i].name +
										"." +
										symbols[i].methods[j].name
							) {
								return {
									symbol: symbols[i],
									member: symbols[i].methods[j],
								};
							}
						}
					}
				}
			}
		}
		return undefined;
	}

	async getSymbol(sEntityName: string): Promise<LibDocSymbol> {
		this.mEntityToSymbol = this.mEntityToSymbol || new Map();
		let result = this.mEntityToSymbol.get(sEntityName);
		if (result) {
			return result;
		}

		result = this.findLibrary(sEntityName).then(sLibrary => {
			return this.getLibraryMetaInformation(sLibrary).then(oLibDoc => {
				return this.findSymbol(oLibDoc, sEntityName);
			});
		});
		this.mEntityToSymbol.set(sEntityName, result);
		return result;
	}

	/**
	 * Recursive
	 * @param sEntityName
	 * @param resolveInheritance
	 */
	async getMeta(
		sEntityName: string,
		resolveInheritance: boolean
	): Promise<MetaObject | undefined> {
		// TODO use memoization
		function merge(name, meta, meta2) {
			const r1 = meta[name];
			const r2 = meta2[name];
			if (r1 && r1.length && r2 && r2.length) {
				r2.forEach(item => {
					if (!r1.some(candidate => candidate.name === item.name)) {
						r1.push(item);
					}
				});
			} else if (r2 && r2.length) {
				meta[name] = r2;
			}
		}

		return this.getSymbol(sEntityName).then((symbol: LibDocSymbol) => {
			let meta = symbol && symbol["ui5-metadata"];
			if (meta) {
				// TODO implement merge on symbol, not on metadata
				meta = JSON.parse(JSON.stringify(meta));
				if (resolveInheritance && symbol.extends) {
					return this.getMeta(symbol.extends, true).then(meta2 => {
						if (meta2) {
							meta.defaultAggregation =
								meta.defaultAggregation ||
								meta2.defaultAggregation;
							merge("specialSettings", meta, meta2);
							merge("properties", meta, meta2);
							merge("aggregations", meta, meta2);
							merge("associations", meta, meta2);
							merge("events", meta, meta2);
						} else {
							this.reporter.report(
								ReportLevel.ERROR,
								"couldn't find base class " + symbol.extends
							);
						}
						return undefined;
					});
				}
			}
			return meta;
		});
	}

	getLocalLibraryAPIJSON(sLibrary: string) {
		return this.mApi && this.mApi[sLibrary];
	}

	getLocalResourcesAPIJSON(sLibrary: string) {
		return (
			this.mApiIncludedResources && this.mApiIncludedResources[sLibrary]
		);
	}

	/**
	 *
	 * @param sLibrary
	 * @return {Promise}
	 */
	async getLibraryMetaInformation(sLibrary: string): Promise<LibDoc> {
		if (!sLibrary) {
			return Promise.resolve(EMPTY_LIB_DOC);
		}

		let oLibraryDoc = this.oLibraryDocumentation[sLibrary];

		if (oLibraryDoc) {
			return Promise.resolve(oLibraryDoc);
		}

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;

		const fnEnrichLibraryDoc = function (oResources, oLibraryDoc: LibDoc) {
			if (Array.isArray(oResources.resources)) {
				oResources.resources.forEach(resource => {
					if (
						/\.js$/.test(resource.module) &&
						!resource.isDebug &&
						!that.findModule(resource.module, oLibraryDoc)
					) {
						// reporter.report(ReportLevel.TRACE,"  adding symbol
						// for module " + resource.module);
						oLibraryDoc.symbols.push({
							kind: "namespace",
							name: resource.module
								.replace(/\.js$/, "")
								.replace(/\//g, "."),
							module: resource.module.replace(/\.js$/, ""),
							export: "",
							visibility: "private",
						});
					}
				});
			}
		};

		try {
			oLibraryDoc = this.getLocalLibraryAPIJSON(sLibrary);

			const aLoadLibraryApiJson = [];
			if (oLibraryDoc) {
				aLoadLibraryApiJson.push(Promise.resolve(oLibraryDoc));
			} else if (this.rootPath) {
				aLoadLibraryApiJson.push(
					this.loadJSON(
						this.rootPath,
						"test-resources/" +
							sLibrary.replace(/\./g, "/") +
							"/designtime/api.json"
					).then(
						(oRes: LibDoc): LibDoc => {
							oLibraryDoc = {
								// make a copy of the symbols from the
								// response
								// because it may be extended and the
								// original
								// result in the cache shouldn't be
								// modified
								symbols: oRes.symbols.slice(),
							};
							this.oLibraryDocumentation[sLibrary] = oLibraryDoc;
							return oLibraryDoc;
						},
						() => {
							this.reporter.report(
								ReportLevel.TRACE,
								`Failed to load library ${sLibrary}`
							);
							this.oLibraryDocumentation[sLibrary] =
								EMPTY_LIB_DOC;
							oLibraryDoc = EMPTY_LIB_DOC;
							return EMPTY_LIB_DOC;
						}
					)
				);
			} else {
				return Promise.resolve(EMPTY_LIB_DOC);
			}

			const oResources = this.getLocalResourcesAPIJSON(sLibrary);
			if (oResources) {
				aLoadLibraryApiJson.push(Promise.resolve(oResources));
			} else if (this.rootPath) {
				aLoadLibraryApiJson.push(
					this.loadJSON(
						this.rootPath,
						"resources/" +
							sLibrary.replace(/\./g, "/") +
							"/resources.json"
					).catch(() => {
						this.reporter.report(
							ReportLevel.TRACE,
							`Failed to load resources for ${sLibrary}`
						);
						return {};
					})
				);
			}

			return Promise.all(aLoadLibraryApiJson).then(aResults => {
				oLibraryDoc = this.postProcessAPIJSON(
					oLibraryDoc || EMPTY_LIB_DOC,
					this.reporter
				);
				if (aResults.length > 1) {
					fnEnrichLibraryDoc(aResults[1], oLibraryDoc);
				}
				this.oLibraryDocumentation[sLibrary] = oLibraryDoc;
				return oLibraryDoc;
			});
		} catch (e) {
			oLibraryDoc = this.oLibraryDocumentation[sLibrary] = null; // avoid future tries to load this file
			this.reporter.report(
				ReportLevel.ERROR,
				"failed to loaded api.json for " + sLibrary + ": " + e
			);
			return Promise.reject(e);
		}
	}
}

/**
 * Creates a new APIInfo object
 * @param oOptions
 */
export function create(oOptions: APIInfoOptions) {
	return new APIInfo(oOptions);
}
