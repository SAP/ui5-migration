import {Extender} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

/**
 * Adds an import to the define statement
 */
class AddImportWithResolvedPath implements Extender {
	extend(
		defineCall: SapUiDefineCall,
		config: {
			newModulePath: string;
			newVariableName: string;
		}
	): boolean {
		const bExists = defineCall
			.getAbsoluteDependencyPaths()
			.some(path => path.endsWith(config.newModulePath));

		if (!bExists) {
			return defineCall.addDependency(
				config.newModulePath,
				config.newVariableName
			);
		} else {
			return false;
		}
	}
}

module.exports = new AddImportWithResolvedPath();
