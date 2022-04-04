import {DiffStringOptimizeStrategy} from "../../../src/util/whitespace/DiffStringOptimizeStrategy";
import {CustomReporter} from "../testUtils";

const assert = require("assert");
const fs = require("fs");
const rootDir = "./test/util/whitespace/diffresources/";

const EOL_REGEXP = /\r?\n/g;

describe("DiffStringOptimizeStrategy", () => {
	const aCommonLogs = [
		"trace: DIFF: Found 125 diffs",
		"trace: DIFF Added 103:  '[\\t]'",
		"trace: DIFF Skipped 104:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 118:  '[\\t]'",
		"trace: DIFF Skipped 119:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 144:  '[\\t]'",
		"trace: DIFF Skipped 145:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 173:  '[\\t]'",
		"trace: DIFF Skipped 174:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 203:  '[\\t]'",
		"trace: DIFF Skipped 204:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 221:  '[\\t]'",
		"trace: DIFF Skipped 222:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 243:  '[\\t]'",
		"trace: DIFF Skipped 244:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 262:  '[\\t]'",
		"trace: DIFF Skipped 263:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 280:  '[\\t]'",
		"trace: DIFF Skipped 281:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 303:  '[\\t]'",
		"trace: DIFF Skipped 304:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 332:  '[\\t]'",
		"trace: DIFF Skipped 333:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 358:  '[\\t]'",
		"trace: DIFF Skipped 359:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 389:  '[\\t]'",
		"trace: DIFF Skipped 390:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 422:  '[\\t]'",
		"trace: DIFF Skipped 423:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 456:  '[\\t]'",
		"trace: DIFF Skipped 457:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 485:  '[\\t]'",
		"trace: DIFF Skipped 486:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 515:  '[\\t]'",
		"trace: DIFF Skipped 516:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 540:  '[\\t]'",
		"trace: DIFF Skipped 541:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 578:  '[\\t]'",
		"trace: DIFF Skipped 579:  '[ ][ ][ ][ ]'",
		"trace: DIFF Added 651:  '[ ]'",
	];

	const commonLogs = (begin, end) => {
		return [
			`trace: Performing DiffStringOptimizeStrategy ${begin} and ${end}`,
		].concat(aCommonLogs);
	};

	[
		{
			baseName: "batch",
			fileEOL: "\r\n",
			logs: [
				...commonLogs(76171, 76259),
				"trace: DIFF Skipped 653:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 661:  '[ ]'",
				"trace: DIFF Skipped 662:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 683:  '[ ]'",
				"trace: DIFF Skipped 684:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 702:  '[ ]'",
				"trace: DIFF Skipped 703:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 722:  '[ ]'",
				"trace: DIFF Skipped 723:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 732:  '[ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ]'",
				"trace: DIFF Skipped 745:  '[\\t]'",
				"trace: DIFF Added 756:  '[ ]'",
				"trace: DIFF Skipped 757:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 765:  '[ ]'",
				"trace: DIFF Skipped 766:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 770:  '[ ]'",
				"trace: DIFF Skipped 771:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 775:  '[ ]'",
				"trace: DIFF Skipped 776:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 788:  '[ ]'",
				"trace: DIFF Skipped 789:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 797:  '[ ]'",
				"trace: DIFF Skipped 798:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 811:  '[ ]'",
				"trace: DIFF Skipped 812:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 829:  '[ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ]'",
				"trace: DIFF Skipped 842:  '[\\t]'",
				"trace: DIFF Added 858:  '[ ]'",
				"trace: DIFF Skipped 859:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 870:  '[ ]'",
				"trace: DIFF Skipped 871:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 883:  '[ ]'",
				"trace: DIFF Skipped 884:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 891:  '[ ]'",
				"trace: DIFF Skipped 892:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 906:  '[ ]'",
				"trace: DIFF Skipped 907:  '[\\r][\\n][\\t]'",
			],
		},
		{
			baseName: "list",
			fileEOL: "\r\n",
			logs: [
				...commonLogs(1363, 1476),
				"trace: DIFF Skipped 653:  '[\\r][\\n][ ][ ][ ][ ]'",
				"trace: DIFF Added 661:  '[ ]'",
				"trace: DIFF Skipped 662:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 683:  '[ ]'",
				"trace: DIFF Skipped 684:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 702:  '[ ]'",
				"trace: DIFF Skipped 703:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 722:  '[ ]'",
				"trace: DIFF Skipped 723:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 732:  '[\\t][\\t]'",
				"trace: DIFF Skipped 734:  '[\\t]'",
				"trace: DIFF Added 745:  '[ ]'",
				"trace: DIFF Skipped 746:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 754:  '[ ]'",
				"trace: DIFF Skipped 755:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 759:  '[ ]'",
				"trace: DIFF Skipped 760:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 764:  '[ ]'",
				"trace: DIFF Skipped 765:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 777:  '[ ]'",
				"trace: DIFF Skipped 778:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 786:  '[ ]'",
				"trace: DIFF Skipped 787:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 800:  '[ ]'",
				"trace: DIFF Skipped 801:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 818:  '[\\t][\\t]'",
				"trace: DIFF Skipped 820:  '[\\t]'",
				"trace: DIFF Added 836:  '[ ]'",
				"trace: DIFF Skipped 837:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 848:  '[ ]'",
				"trace: DIFF Skipped 849:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 861:  '[ ]'",
				"trace: DIFF Skipped 862:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 869:  '[ ]'",
				"trace: DIFF Skipped 870:  '[\\r][\\n][\\t]'",
				"trace: DIFF Added 884:  '[ ]'",
				"trace: DIFF Skipped 885:  '[\\r][\\n][\\t]'",
			],
		},
		{
			baseName: "actions",
			fileEOL: "\r\n",
			logs: [
				"trace: Performing DiffStringOptimizeStrategy 496 and 576",
				"trace: DIFF: Found 33 diffs",
				"trace: DIFF Added 576:  '[\\r][\\n]'",
			],
		},
		{
			baseName: "abap",
			fileEOL: "\r\n",
			logs: [
				"trace: Performing DiffStringOptimizeStrategy 408 and 428",
				"trace: DIFF: Found 14 diffs",
				"trace: DIFF Added 16:  '[\\r][\\n][ ][ ][ ][ ]'",
				"trace: DIFF Added 74:  '[\\r][\\n][ ][ ][ ][ ]'",
				"trace: DIFF Skipped 80:  '[ ]'",
				"trace: DIFF Added 111:  '[\\r][\\n]'",
				"trace: DIFF Added 152:  '[ ]'",
				"trace: DIFF Added 442:  '[\\r][\\n]'",
			],
		},
		{
			baseName: "endless",
			fileEOL: "\r\n",
			logs: [
				"trace: Performing DiffStringOptimizeStrategy 179 and 83",
				"trace: DIFF: Found 18 diffs",
				"trace: DIFF Added 48:  '[ ]'",
				"trace: DIFF Added 84:  '[\\r][\\n]'",
			],
		},
		{
			baseName: "structure",
			fileEOL: "\r\n",
			description:
				"structural change by wrapping everything inside a sap.ui.define",
			logs: [
				"trace: Performing DiffStringOptimizeStrategy 218 and 283",
				"trace: DIFF: Found 25 diffs",
				"trace: DIFF Added 57:  '[ ]'",
				"trace: DIFF Skipped 58:  '[\\t][ ]'",
				"trace: DIFF Added 105:  '[ ]'",
				"trace: DIFF Skipped 106:  '[\\t][ ]'",
				"trace: DIFF Added 109:  '[ ]'",
				"trace: DIFF Skipped 110:  '[\\t][ ]'",
				"trace: DIFF Skipped 114:  '[\\t]'",
				"trace: DIFF Added 134:  '[\\t]'",
				"trace: DIFF Skipped 135:  '[\\t][\\t]'",
				"trace: DIFF Added 179:  '[\\t][\\t]'",
				"trace: DIFF Skipped 181:  '[\\t][\\t][\\t]'",
				"trace: DIFF Added 252:  '[\\t]'",
				"trace: DIFF Skipped 253:  '[\\t][\\t]'",
				"trace: DIFF Skipped 269:  '[\\t]'",
			],
		},
	].forEach(oTestConfig => {
		it(
			"Should optimize " +
				oTestConfig.baseName +
				(oTestConfig.description
					? " (" + oTestConfig.description + ")"
					: ""),
			async () => {
				let source = fs.readFileSync(
					rootDir + oTestConfig.baseName + ".source.js",
					"UTF-8"
				);
				let modified = fs.readFileSync(
					rootDir + oTestConfig.baseName + ".modified.js",
					"UTF-8"
				);
				let expected = fs.readFileSync(
					rootDir + oTestConfig.baseName + ".expected.js",
					"UTF-8"
				);

				if (oTestConfig.fileEOL) {
					source = source.replace(EOL_REGEXP, oTestConfig.fileEOL);
					modified = modified.replace(
						EOL_REGEXP,
						oTestConfig.fileEOL
					);
					expected = expected.replace(
						EOL_REGEXP,
						oTestConfig.fileEOL
					);
				}

				const reports = [];
				const diffStringOptimizeStrategy =
					new DiffStringOptimizeStrategy(
						new CustomReporter(reports, "trace")
					);
				const sOptimized =
					await diffStringOptimizeStrategy.optimizeString(
						source,
						modified
					);

				assert.deepStrictEqual(
					sOptimized,
					expected,
					"string should be optimized"
				);
				assert.deepStrictEqual(
					reports,
					oTestConfig.logs,
					"logs should match"
				);
			}
		);
	});
});
