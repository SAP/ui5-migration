import {parse} from "espree";
import * as recast from "recast";

const hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

/*
 * NOTE: After updating the ecmaVersion:
 * - Adopt JSModuleAnalyzer to handle new Syntax / VisitorKeys.
 * - Adjust the JSModuleAnalyzer test "Check for consistency between VisitorKeys and EnrichedVisitorKeys"
 *   (See comments in test for details)
 */
export const ecmaVersion = 2022;

export function parse(code: string, userOptions = {}): recast.File {
	const options = {
		comment: true,
		ecmaVersion,
		range: false,
		sourceType: "script",
		loc: true,
		// if this is set to false, recast uses esprima to tokenize
		tokens: true,
	};

	for (const [name, value] of Object.entries(userOptions)) {
		if (!hasOwn(options, name)) {
			throw new TypeError(
				`Allowed parser options are ${Object.keys(
					options
				)}, but not '${name}'`
			);
		}
		options[name] = value;
	}

	return recast.parse(code, {
		parser: {
			parse(code: string) {
				return parse(code, options);
			},
		},
	});
}
