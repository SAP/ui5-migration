import {Extender} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

class LeaveImportExtender implements Extender {
	/**
	 *
	 * @param {SapUiDefineCall} defineCall
	 * @param config
	 * @returns {boolean}
	 */
	extend(defineCall: SapUiDefineCall, config: {}): boolean {
		return true;
	}
}

module.exports = new LeaveImportExtender();
