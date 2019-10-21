import {Extender} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

class JQueryDependencyCleanupExtender implements Extender {
	/**
	 *
	 * @param {SapUiDefineCall} defineCall
	 * @param config
	 * @returns {boolean}
	 */
	extend(
		defineCall: SapUiDefineCall,
		config: {
			newVariableName: string;
			variableNameToFind: string;
		}
	): boolean {
		const newVariableName = config.newVariableName;
		const variableNameToFind = config.variableNameToFind;

		const bContainsJQueryDOM =
			defineCall.paramNames.indexOf(variableNameToFind) > -1;
		const bContainsJQuery =
			defineCall.paramNames.indexOf(newVariableName) > -1;

		// 1 jQueryDOM
		if (bContainsJQueryDOM && !bContainsJQuery) {
			const iIndex = defineCall.paramNames.indexOf(variableNameToFind);
			defineCall.modifyDependency(
				iIndex,
				defineCall.getImportByParamName(variableNameToFind),
				newVariableName
			);
		} else if (bContainsJQueryDOM && bContainsJQuery) {
			// jQueryDOM and jQuery
			defineCall.removeDependency(
				defineCall.getImportByParamName(variableNameToFind)
			);
		} else {
			// 2 only jQuery
			// nais
			return false;
		}

		return true;
	}
}

module.exports = new JQueryDependencyCleanupExtender();
