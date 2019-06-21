const assert = require("assert");

module.exports = {

	/**
	* Asserts that two strings of code are equal while ignoring whitespace styles
	*
	* @param actual The result string of the test
	* @param expected The expected result string of the test
	* @param message An optional message used in the assertion exception
	*/
	equalNormalizedString: function(actual, expected, message) {
		const actualCleaned = new String(actual).replace(/\r\n/g, "\n").replace(/[ \t]{2,}/g, " ");
		const expectedCleaned = new String(expected).replace(/\r\n/g, "\n").replace(/[ \t]{2,}/g, " ");
		return assert.equal(actualCleaned, expectedCleaned, message);
	}
};
