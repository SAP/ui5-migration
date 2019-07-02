import {DiffStringOptimizeStrategy} from "../../../src/util/whitespace/DiffStringOptimizeStrategy";
import {CustomReporter} from "../testUtils";


const assert = require("assert");
const fs = require("fs");
const rootDir = "./test/util/whitespace/diffresources/";

describe("DiffStringOptimizeStrategy", function() {
	const aCommonLogs = [
		"trace: DIFF: Found 123 diffs",
		"trace: DIFF Added 101:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 104:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 116:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 119:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 142:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 145:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 171:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 174:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 201:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 204:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 219:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 222:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 241:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 244:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 260:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 263:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 278:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 281:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 301:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 304:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 330:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 333:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 356:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 359:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 387:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 390:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 420:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 423:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 454:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 457:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 483:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 486:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 513:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 516:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 538:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 541:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 576:  '[\\r][\\n][\\t]'",
		"trace: DIFF Skipped 579:  '[\\r][\\n][ ][ ][ ][ ]'",
		"trace: DIFF Added 651:  '[ ]'",
	];

	const commonLogs = (begin, end) => {
		return [
			`trace: Performing DiffStringOptimizeStrategy ${begin} and ${end}`
		].concat(aCommonLogs);
	};



	[{
		baseName : "batch",
		logs : [
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
			"trace: DIFF Added 730:  '[\\r][\\n][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ]'",
			"trace: DIFF Skipped 745:  '[\\r][\\n][\\t]'",
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
			"trace: DIFF Added 827:  '[\\r][\\n][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ]'",
			"trace: DIFF Skipped 842:  '[\\r][\\n][\\t]'",
			"trace: DIFF Added 858:  '[ ]'",
			"trace: DIFF Skipped 859:  '[\\r][\\n][\\t]'",
			"trace: DIFF Added 870:  '[ ]'",
			"trace: DIFF Skipped 871:  '[\\r][\\n][\\t]'",
			"trace: DIFF Added 883:  '[ ]'",
			"trace: DIFF Skipped 884:  '[\\r][\\n][\\t]'",
			"trace: DIFF Added 891:  '[ ]'",
			"trace: DIFF Skipped 892:  '[\\r][\\n][\\t]'",
			"trace: DIFF Added 906:  '[ ]'",
			"trace: DIFF Skipped 907:  '[\\r][\\n][\\t]'"
		]
	},
	 {
		 baseName : "list",
		 logs : [
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
			 "trace: DIFF Added 730:  '[\\r][\\n][\\t][\\t]'",
			 "trace: DIFF Skipped 734:  '[\\r][\\n][\\t]'",
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
			 "trace: DIFF Added 816:  '[\\r][\\n][\\t][\\t]'",
			 "trace: DIFF Skipped 820:  '[\\r][\\n][\\t]'",
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
		 ]
	 },
	 {
		 baseName : "actions",
		 logs : [
			 "trace: Performing DiffStringOptimizeStrategy 496 and 576",
			 "trace: DIFF: Found 33 diffs",
			 "trace: DIFF Added 576:  '[\\r][\\n]'"
		 ]
	 },
	 {
		 baseName : "abap",
		 logs : [
			 "trace: Performing DiffStringOptimizeStrategy 408 and 428",
			 "trace: DIFF: Found 14 diffs",
			 "trace: DIFF Added 16:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 74:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Skipped 80:  '[ ]'",
			 "trace: DIFF Added 111:  '[\\r][\\n]'",
			 "trace: DIFF Added 152:  '[ ]'",
			 "trace: DIFF Added 442:  '[\\r][\\n]'"
		 ]
	 },
	 {
		 baseName : "endless",
		 logs : [
			 "trace: Performing DiffStringOptimizeStrategy 179 and 83",
			 "trace: DIFF: Found 16 diffs", "trace: DIFF Added 48:  '[ ]'",
			 "trace: DIFF Added 84:  '[\\r][\\n]'"
		 ]
	 },
	 {
		 baseName : "structure",
		 description :
			 "structural change by wrapping everything inside a sap.ui.define",
		 logs : [
			 "trace: Performing DiffStringOptimizeStrategy 218 and 283",
			 "trace: DIFF: Found 26 diffs",
			 "trace: DIFF Added 55:  '[\\r][\\n][ ]'",
			 "trace: DIFF Skipped 58:  '[\\r][\\n][\\t][ ]'",
			 "trace: DIFF Added 103:  '[\\r][\\n][ ]'",
			 "trace: DIFF Skipped 106:  '[\\r][\\n][\\t][ ]'",
			 "trace: DIFF Added 107:  '[\\r][\\n][ ]'",
			 "trace: DIFF Skipped 110:  '[\\r][\\n][\\t][ ]'",
			 "trace: DIFF Added 112:  '[\\r][\\n]'",
			 "trace: DIFF Skipped 114:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Added 132:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 135:  '[\\r][\\n][\\t][\\t]'",
			 "trace: DIFF Added 177:  '[\\r][\\n][\\t][\\t]'",
			 "trace: DIFF Skipped 181:  '[\\r][\\n][\\t][\\t][\\t]'",
			 "trace: DIFF Added 248:  '[\\r][\\n][\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 253:  '[\\r][\\n][\\r][\\n][\\t][\\t]'",
		 ]
	 }].forEach((oTestConfig) => {
		it("Should optimize " + oTestConfig.baseName +
			   (oTestConfig.description ? " (" + oTestConfig.description + ")" :
										  ""),
		   async function() {
			   const source = fs.readFileSync(
				   rootDir + oTestConfig.baseName + ".source.js", "UTF-8");
			   const modified = fs.readFileSync(
				   rootDir + oTestConfig.baseName + ".modified.js", "UTF-8");
			   const expected = fs.readFileSync(
				   rootDir + oTestConfig.baseName + ".expected.js", "UTF-8");
			   const reports = [];
			   const diffStringOptimizeStrategy =
				   new DiffStringOptimizeStrategy(
					   new CustomReporter(reports, "trace"));
			   const sOptimized =
				   await diffStringOptimizeStrategy.optimizeString(
					   source, modified);

			   assert.deepStrictEqual(
				   sOptimized, expected, "string should be optimized");
			   assert.deepStrictEqual(
				   reports, oTestConfig.logs, "logs should match");
		   });
	});
});