import {Extender} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

/**
 * Adds an import to the define statement
 */
class AddImport implements Extender {
	extend(
		defineCall: SapUiDefineCall,
		config: {
			newModulePath: string;
			newVariableName: string;
		},
		name: string
	): boolean {
		return defineCall.addDependency(
			config.newModulePath,
			name || config.newVariableName
		);
	}
}

module.exports = new AddImport();
