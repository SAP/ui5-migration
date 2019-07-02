import {DiffAndAstStringOptimizeStrategy} from "../../../src/util/whitespace/DiffAndAstStringOptimizeStrategy";
import {CustomReporter} from "../testUtils";


const assert = require("assert");
const fs = require("fs");
const rootDir = "./test/util/whitespace/diffandastresources/";

const EOL_REGEXP = /\r?\n/g;

describe("DiffAndAstStringOptimizeStrategy", function() {
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
		fileEOL : "\r\n",
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
			"trace: DIFF Skipped 907:  '[\\r][\\n][\\t]'",
			"trace: Performing AstStringOptimizeStrategy",
			"trace: AST: whitespace diff for preceding element",
			"trace: AST: remove '[\\r][\\n][ ][ ][ ][ ]'",
			"trace: AST: add '[\\r][\\n][\\t]'",
			"trace: AST: index: 611",
			"trace: AST: whitespace diff for preceding element",
			"trace: AST: remove '[\\r][\\n][\\t]'",
			"trace: AST: add '[ ]'",
			"trace: AST: index: 916",
			"trace: AST: whitespace diff for succeeding element",
			"trace: AST: remove '[\\r][\\n]'",
			"trace: AST: add '[]'",
			"trace: AST: index: 921",
		]
	},
	 {
		 baseName : "list",
		 fileEOL : "\r\n",
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
			 "trace: Performing AstStringOptimizeStrategy",
			 "trace: AST: whitespace diff for preceding element",
			 "trace: AST: remove '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: AST: add '[\\r][\\n][\\t]'",
			 "trace: AST: index: 611",
			 "trace: AST: whitespace diff for preceding element",
			 "trace: AST: remove '[\\r][\\n][\\t]'",
			 "trace: AST: add '[ ]'",
			 "trace: AST: index: 894",
			 "trace: AST: whitespace diff for succeeding element",
			 "trace: AST: remove '[\\r][\\n]'",
			 "trace: AST: add '[]'",
			 "trace: AST: index: 899"
		 ]
	 },
	 {
		 baseName : "actions",
		 fileEOL : "\r\n",
		 logs : [
			 "trace: Performing DiffStringOptimizeStrategy 496 and 576",
			 "trace: DIFF: Found 33 diffs",
			 "trace: DIFF Added 576:  '[\\r][\\n]'",
			 "trace: Performing AstStringOptimizeStrategy"
		 ]
	 },
	 {
		 baseName : "abap",
		 fileEOL : "\r\n",
		 logs : [
			 "trace: Performing DiffStringOptimizeStrategy 408 and 428",
			 "trace: DIFF: Found 14 diffs",
			 "trace: DIFF Added 16:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 74:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Skipped 80:  '[ ]'",
			 "trace: DIFF Added 111:  '[\\r][\\n]'",
			 "trace: DIFF Added 152:  '[ ]'",
			 "trace: DIFF Added 442:  '[\\r][\\n]'",
			 "trace: Performing AstStringOptimizeStrategy",
			 "trace: AST: whitespace diff for preceding element",
			 "trace: AST: remove '[ ]'",
			 "trace: AST: add '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: AST: index: 114",
			 "trace: AST: whitespace diff for succeeding element",
			 "trace: AST: remove '[\\r][\\n]'",
			 "trace: AST: add '[]'",
			 "trace: AST: index: 111",
			 "trace: AST: whitespace diff for succeeding element",
			 "trace: AST: remove '[]'",
			 "trace: AST: add '[\\r][\\n]'",
			 "trace: AST: index: 141",
		 ]
	 },
	 {
		 baseName : "endless",
		 fileEOL : "\r\n",
		 logs : [
			 "trace: Performing DiffStringOptimizeStrategy 189 and 93",
			 "trace: DIFF: Found 21 diffs", "trace: DIFF Added 48:  '[ ]'",
			 "trace: DIFF Added 89:  '[\\r][\\n][\\r][\\n]'",
			 "trace: DIFF Skipped 93:  '[\\r][\\n]'",
			 "trace: DIFF Added 96:  '[\\r][\\n]'",
			 "trace: Performing AstStringOptimizeStrategy"
		 ]
	 },
	 {
		 baseName : "structure",
		 fileEOL : "\r\n",
		 description :
			 "structural change by wrapping everything inside a sap.ui.define",
		 logs : [
			 "trace: Performing AstStringOptimizeStrategy",
			 "trace: AST: whitespace diff for preceding element",
			 "trace: AST: remove '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: AST: add '[\\r][\\n][\\t]'", "trace: AST: index: 35"
		 ]
	 },
	 {
		 baseName : "structure2",
		 fileEOL : "\r\n",
		 description :
			 "structural change by wrapping everything inside a sap.ui.define",
		 logs : [
			 "trace: Performing AstStringOptimizeStrategy",
			 "trace: AST: whitespace diff for preceding element",
			 "trace: AST: remove '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: AST: add '[\\r][\\n][\\t]'", "trace: AST: index: 35",
			 "trace: AST: whitespace diff for preceding element",
			 "trace: AST: remove '[]'", "trace: AST: add '[\\r][\\n]'",
			 "trace: AST: index: -1"
		 ]
	 },
	 {
		 baseName : "newlines",
		 fileEOL : "\r\n",
		 description : "new lines",
		 logs : [
			 "trace: Performing DiffStringOptimizeStrategy 2226 and 2407",
			 "trace: DIFF: Found 40 diffs",
			 "trace: DIFF Added 15:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 18:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 42:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 45:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 60:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 63:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 86:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 89:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 115:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 118:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 131:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 134:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 162:  '[ ]'",
			 "trace: DIFF Added 230:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 233:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: Performing AstStringOptimizeStrategy"
		 ]
	 },
	 {
		 baseName : "multiline",
		 fileEOL : "\r\n",
		 description : "multiple lines",
		 logs : [
			 "trace: Performing DiffStringOptimizeStrategy 13025 and 13082",
			 "trace: DIFF: Found 53 diffs",
			 "trace: DIFF Added 41:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 44:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 77:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 80:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 128:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 131:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 165:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 168:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 200:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 203:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 232:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 235:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 432:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 435:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: Performing AstStringOptimizeStrategy",
			 "trace: AST: whitespace diff for preceding element",
			 "trace: AST: remove '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: AST: add '[\\r][\\n][\\t]'",
			 "trace: AST: index: 262",
			 "trace: AST: whitespace diff for preceding element",
			 "trace: AST: remove '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: AST: add '[\\r][\\n][\\t]'",
			 "trace: AST: index: 301"
		 ]
	 },
	 {
		 baseName : "multilineprop",
		 fileEOL : "\r\n",
		 description : "multiple lines in property",
		 logs : [
			 "trace: Performing DiffStringOptimizeStrategy 10125 and 10441",
			 "trace: DIFF: Found 122 diffs",
			 "trace: DIFF Added 15:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 18:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 68:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 71:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 95:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 98:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 128:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 131:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 153:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 156:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 169:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 172:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 203:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 206:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 247:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 250:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 272:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 275:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 305:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 308:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 334:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 337:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 371:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 374:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 394:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 397:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 436:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 439:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 469:  '[\\r][\\n][\\r][\\n]'",
			 "trace: DIFF Added 583:  '[ ]'",
			 "trace: DIFF Skipped 585:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 600:  '[ ]'",
			 "trace: DIFF Skipped 601:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Added 607:  '[ ]'",
			 "trace: DIFF Skipped 608:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Added 618:  '[ ]'",
			 "trace: DIFF Skipped 619:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Added 631:  '[ ]'",
			 "trace: DIFF Skipped 632:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Added 637:  '[ ]'",
			 "trace: DIFF Skipped 638:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 650:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Added 712:  '[ ]'",
			 "trace: DIFF Skipped 713:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Added 728:  '[ ]'",
			 "trace: DIFF Skipped 729:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Added 740:  '[ ]'",
			 "trace: DIFF Skipped 741:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Added 751:  '[ ]'",
			 "trace: DIFF Skipped 752:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Added 764:  '[ ]'",
			 "trace: DIFF Skipped 765:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Added 781:  '[ ]'",
			 "trace: DIFF Skipped 782:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Added 837:  '[\\r][\\n][\\t]'",
			 "trace: DIFF Skipped 840:  '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: DIFF Added 10365:  '[\\r][\\n][\\r][\\n]'",
			 "trace: DIFF Skipped 10369:  '[\\r][\\n]'",
			 "trace: DIFF Added 10372:  '[\\r][\\n]'",
			 "trace: Performing AstStringOptimizeStrategy",
			 "trace: AST: whitespace diff for preceding element",
			 "trace: AST: remove '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: AST: add '[\\r][\\n][\\t]'",
			 "trace: AST: index: 479",
			 "trace: AST: whitespace diff for preceding element",
			 "trace: AST: remove '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: AST: add '[\\r][\\n][\\t]'",
			 "trace: AST: index: 507",
			 "trace: AST: whitespace diff for preceding element",
			 "trace: AST: remove '[\\r][\\n][ ][ ][ ][ ]'",
			 "trace: AST: add '[\\r][\\n][\\t]'",
			 "trace: AST: index: 540",
			 "trace: AST: whitespace diff for succeeding element",
			 "trace: AST: remove '[\\r][\\n][\\r][\\n]'",
			 "trace: AST: add '[]'",
			 "trace: AST: index: 469",
			 "trace: AST: whitespace diff for succeeding element",
			 "trace: AST: remove '[\\r][\\n]'",
			 "trace: AST: add '[\\r][\\n][\\r][\\n]'",
			 "trace: AST: index: 570",
			 "trace: AST: whitespace diff for preceding element",
			 "trace: AST: remove '[\\r][\\n][\\t]'",
			 "trace: AST: add '[ ]'",
			 "trace: AST: index: 684",
			 "trace: AST: whitespace diff for preceding element",
			 "trace: AST: remove '[\\r][\\n][\\t]'",
			 "trace: AST: add '[ ]'",
			 "trace: AST: index: 796",
			 "trace: AST: whitespace diff for preceding element",
			 "trace: AST: remove '[\\r][\\n][\\t]'",
			 "trace: AST: add '[ ]'",
			 "trace: AST: index: 811",
			 "trace: AST: whitespace diff for preceding element",
			 "trace: AST: remove '[\\r][\\n][\\t]'",
			 "trace: AST: add '[ ]'",
			 "trace: AST: index: 821",
			 "trace: AST: whitespace diff for succeeding element",
			 "trace: AST: remove '[\\r][\\n]'",
			 "trace: AST: add '[]'",
			 "trace: AST: index: 832",
		 ]
	 }].forEach((oTestConfig) => {
		it("Should optimize " + oTestConfig.baseName +
			   (oTestConfig.description ? " (" + oTestConfig.description + ")" :
										  ""),
		   async function() {
			   let source = fs.readFileSync(
				   rootDir + oTestConfig.baseName + ".source.js", "UTF-8");
			   let modified = fs.readFileSync(
				   rootDir + oTestConfig.baseName + ".modified.js", "UTF-8");
			   let expected = fs.readFileSync(
				   rootDir + oTestConfig.baseName + ".expected.js", "UTF-8");

			   if (oTestConfig.fileEOL) {
				   source = source.replace(EOL_REGEXP, oTestConfig.fileEOL);
				   modified = modified.replace(EOL_REGEXP, oTestConfig.fileEOL);
				   expected = expected.replace(EOL_REGEXP, oTestConfig.fileEOL);
			   }

			   const reports = [];
			   const diffAndAstStringOptimizeStrategy =
				   new DiffAndAstStringOptimizeStrategy(
					   new CustomReporter(reports, "trace"));
			   const sOptimized =
				   await diffAndAstStringOptimizeStrategy.optimizeString(
					   source, modified);

			   assert.deepStrictEqual(
				   sOptimized, expected, "string should be optimized");
			   assert.deepStrictEqual(
				   reports, oTestConfig.logs, "logs should match");
		   });
	});
});