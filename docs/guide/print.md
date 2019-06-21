# Available print options

The print options can be passed by using `-f` or `--output-format` and then reference a config json file.

The default is:
```json
{
	"tabWidth": 4,
	"useTabs": true,
	"reuseWhitespace": true,
	"lineTerminator": "\n",
	"wrapColumn": 120,
	"quote": "double",
	"auto.lineTerminator": true,
	"auto.useTabs": true,
	"auto.diffOptimization": "DiffAndAstStringOptimizeStrategy"
}
```

| Name | Description |
|:----:|-------------|
| `tabWidth` | Specifies the tab width used for initial formatting, available options are 2 or 4 |
| `useTabs`  | Specifies whether or not to use tabs |
| `reuseWhitespace`  | whether or not to reuse existing whitespaces |
| `lineTerminator`  | default line terminator |
| `wrapColumn`  | maximum line length before a wrap |
| `quote`  | default quotes . Values are `single` and `double` |
| `auto.lineTerminator`  | tries to identify the most used line terminator and overwrites `lineTerminator` option |
| `auto.useTabs`  | tries to identify the most used tab character / tabWidth and overwrites `tabWidth` and `useTab` option |
| `auto.diffOptimization`  | If specified will try to minimize the diff between source and modified regarding white spaces. Strategires are: `MinimalDiffStringOptimizeStrategy`, `DiffStringOptimizeStrategy`, `AstStringOptimizeStrategy` and , `DiffAndAstStringOptimizeStrategy`  |