import {Extender} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

class AddUnusedImportExtender implements Extender {
	extend(
		defineCall: SapUiDefineCall,
		config: {newModulePath: string}
	): boolean {
		return defineCall.addDependency(config.newModulePath);
	}
}

module.exports = new AddUnusedImportExtender();
