# Introducing a new replacement

With the requirement of performing a new code modification, the first question is, which task should
be used to perform the code modification. A brief look at [Tasks](./tasks.md) can help to decide what
kind of task the code modification matches.

## Find the right task

| Feasable |            Name             |      Config (./defaultConfig)      | Description                                                  |
|:--------:|:---------------------------:|:----------------------------------:|--------------------------------------------------------------|
|    ✅    | `fix-jquery-plugin-imports` | addMissingDependencies.config.json | Complex replacements, very dynamic                           |
|    ❌    | `add-renderer-dependencies` |    addRenderers.config.json        | Cannot be enhanced via configuration                         |
|    ❌    |     `apply-amd-syntax`      |       AmdCleaner.config.json       | Cannot be enhanced via configuration                         |
|    ❌    |   `fix-type-dependencies`   |   fixTypeDependency.config.json    | Cannot be enhanced via configuration                         |
|    ✅    |      `replace-globals`      |     replaceGlobals.config.json     | Simple replacements of existing api calls with new api calls |


### Simple replacements via replaceGlobals
For simple modification use replaceGlobals, e.g.
before:
```js
sap.ui.define(["jquery.sap.script"], function(jQuery) {
    "use strict";

    jQuery.each(window.navigator.languages, function (i, value) {
        console.log(i + ":" + value);
    });
});
```

after code modification:
```js
sap.ui.define(["sap/base/util/each"], function(each) {
	"use strict";

	each(window.navigator.languages, function (i, value) {
		console.log(i + ":" + value);
	});
});
```

The config for this replacement is:
```json
{
    "jquery.sap.script": {
      "jQuery.sap.each": {
        "newModulePath": "sap/base/util/each"
      }
    }
}
```

You also realize that you cannot configure much.
You can only influence the
* import via the top level string, e.g. `"jquery.sap.script"`
* the call to replace is found via the second level string, e.g. `"jQuery.sap.each"`
* the replacement itself is found via the third level `"newModulePath": "sap/base/util/each"`


### Complex/Advanced replacements via addMissingDependencies
If your code modification is more advanced use the addMissingDependencies task approach, although
the name suggests something different, these code modifications are highly customizable.
You can configure for a code modification:
* **what** code should be replaced (via a custom `Finder`, which supports a find function and has the currently processed AST Node as argument)
* **how** it should be replaced (via a custom `Replacer`, which supports a replace function and has the found AST Node at hand)
* **how2** the import should look like (via a custom `Extender`, which supports an extend function and has the complete sap.ui.define AST Node)

Since all of them are custom and can be freely configured it brings the most flexibility.
Examples:
* **What**: Alls calls of a "doCalculateIt" function should be replaced which have as argument a positive integer number
* **How**: if the decimal number is even it should be replaced with module "a" and function "even", otherwise with function "odd"
* **How2**: there should be an import added for module "a"

To help out with understanding how the AST is structure, the following page helps:
[Esprima AST](https://esprima.org/demo/parse.html)

#### Example


##### Config

All pieces are glued together in the config `addMissingDependencies.config.json`.
The config is consists of 2 parts, Modules and Definitions

##### Modules
The `modules` section represents the code modifications which should be performed.
top level it contains a custom grouping id, it can be freely chosen, e.g. `jQuery Function Extensions`
the second level contains a unique id for the replacement, it can also be freely chosen, e.g. `*.cursorPos`
 Keep in mind that the configName is passed, e.g. to the `Finder` and used there, so it could play rule
Inside this object there are 3 mandatory keys: `finder`, `extender` and `replacer`, their values are an
alias which can be defined and the respective top level sections `finders`, `extenders` and `replacers`

All other key-values can be accessed inside the finder/extender/replacer code.


##### Definitions
The definitions' area contains sections for `finders`, `extenders` and `replacers`
These consist have a mapping of alias to file name, the alias can then be used in the `modules` sections code replacements


Sections `comments` and `excludes` we ignore for now.

```json
{
	"modules": {
		"my grouping": {
			"my replacement": {
				"newModulePath": "my/numbermodule/a",
				"newVariableName": "a",
				"replacer": "MyCustomReplacer",
				"finder": "MyCustomFinder",
				"extender": "MyCustomExtender"
			}
		}
	},
	"finders": {
		"MyCustomFinder": "tasks/helpers/finders/MyCustomFinder.js"
	},
	"extenders": {
		"MyCustomExtender": "tasks/helpers/extenders/MyCustomExtender.js"
	},
	"replacers": {
		"MyCustomReplacer": "tasks/helpers/replacers/MyCustomReplacer.js"
	},
	"comments": {
		"unhandledReplacementComment": "TODO unhandled replacement"
	},
	"excludes": []
}
```



##### Finder
* **What**: Alls calls of a "doCalculateIt" function should be replaced which have as argument a positive integer number
```ts
import {Syntax} from "esprima";
import * as ESTree from "estree";

import {EMPTY_FINDER_RESULT, Finder, FinderResult} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";
class MyCustomFinder implements Finder {
 /**
  * Finds expression that is a function call named `doCalculateIt` and has a positive integer number as argument
  */
 find(
         node: ESTree.Node,
         config: {},
         sConfigName: string,
         defineCall: SapUiDefineCall
 ): FinderResult {

  // find calls e.g. to `myObject.doCalculateIt(7)`
  if (
          // is a call with positive integer number as argument
          node.type === Syntax.CallExpression && node.arguments.length === 1
          && node.arguments[0].type === Syntax.Literal
          && typeof node.arguments[0].value === "number"
          && node.arguments[0].value >= 0

          // function name is "doCalculateIt" on an unknown variable
          && node.callee.type === Syntax.MemberExpression
          && node.callee.property.type === Syntax.Identifier
          && node.callee.property.name === "doCalculateIt"
  ) {
   return {configName: sConfigName};
  } else {
   return EMPTY_FINDER_RESULT;
  }
 }
}

module.exports = new MyCustomFinder();
```

##### Replacer
* **How**: if the decimal number is even it should be replaced with module "a" and function "even", otherwise with function "odd"

```ts
import {Syntax} from "esprima";
import * as recast from "recast";
import {ASTReplaceable, NodePath} from "ui5-migration";

const builders = recast.types.builders;
class MyCustomReplacer implements ASTReplaceable {
 /**
  * Finds expression that is a function call named `doCalculateIt` and has a positive integer number as argument
  */
 replace(
         node: NodePath, // AST Node wrapper which can be used to navigate to the parent
         name: string, // variable name
         fnName: string,
         oldModuleCall: string,
         config: {newVariableName: string} //config object
 ): void {

  // find calls e.g. to `myObject.doCalculateIt(7)`
  if (
          // is a call with positive integer number as argument
          node.value.type === Syntax.CallExpression && node.value.arguments.length === 1
          && node.value.arguments[0].type === Syntax.Literal
          && typeof node.value.arguments[0].value === "number"
          && node.value.callee.type === Syntax.MemberExpression
  ) {
   node.value.callee.object = builders.identifier(name);
   // even
   if (node.value.arguments[0].value % 2 === 0)  {
    node.value.callee.property = builders.identifier("even");
    // odd
   } else {
    node.value.callee.property = builders.identifier("odd");
   }
  }
 }
}

module.exports = new MyCustomReplacer();
```

#### Extender
* **How2**: there should be an import added for module "a"
```ts
import {Extender} from "../../../dependencies";
import {SapUiDefineCall} from "../../../util/SapUiDefineCall";

/**
 * Adds an import to the define statement
 */
class MyCustomExtender implements Extender {
	extend(
		defineCall: SapUiDefineCall,
		config: {
			newModulePath: string;
			newVariableName: string;
		}
	): boolean {
		return defineCall.addDependency(
			config.newModulePath,
			config.newVariableName
		);
	}
}

module.exports = new MyCustomExtender();
```

##### How to test it
Create 3 files inside the folder test/addMissingDependencies
* source file, e.g. mytestfile.js
* expected file, e.g. mytestfile.expected.js
* config file, e.g. mytestfile.config.json

Reference the test file inside `test/addMissingDependencies.ts`

```ts
it("new test for mytest", done => {
    const subDir = rootDir + "replaceJQuery2/";
    const expectedContent = fs.readFileSync(
        subDir + "mytestfile.expected.js",
        "utf8"
    );
    const config = JSON.parse(
        fs.readFileSync(subDir + "mytestfile.config.json", "utf8")
    );
    const module = new CustomFileInfo(subDir + "mytestfile.js");
    analyseMigrateAndTest(
        module,
        true,
        expectedContent,
        config,
        done,
        []
    );
});
```

and the build it and run the unit test

Note: use `npm run build` to compile the typescript sources

Run `npm run unit` to run the unit tests

Use `it.only(...)` in test files, such that only a [single test](https://mochajs.org/#exclusive-tests) is run.

## Different replacements depending on version
If a code modification depends on the UI5 version being used the following approach should be taken:

The call to replace (second level) should have an `@version` attached and the object should have the property
`version` in the [semver](https://semver.org/) format.

Note: the version property is used for the version comparison, without this property it is treated as `latest`.
The call to replace (second level) must have the `@` with another string to make sure that there are variants for the replacement call.

### example in `addMissingDependencies.config.json`

```json
{
    "jQuery Function Extensions": {
        "*.control@1.58.0": {
            "newModulePath": "sap/ui/dom/jquery/control",
            "replacer": "AddComment",
            "commentText": " jQuery Plugin \"control\"",
            "finder": "JQueryFunctionExtensionFinderWithDependencyCheck",
            "extender": "AddUnusedImportWithComment",
            "version": "^1.58.0"
        },
        "*.control@1.106.0": {
            "newModulePath": "sap/ui/core/Element",
            "newVariableName": "UI5Element",
            "replacer": "UI5ElementClosestTo",
            "finder": "JQueryControlCallFinder",
            "extender": "AddImport",
            "version": "^1.106.0"
        }
    }
}
```

### example in `replaceGlobals.config.json`

```json
{
    "jquery.sap.encoder": {
        "jQuery.sap.validateUrl@1.58.0": {
            "newModulePath": "sap/base/security/URLWhitelist",
            "functionName": "validate",
            "version": "^1.58.0"
        },
        "jQuery.sap.clearUrlWhitelist@1.85.0": {
            "newModulePath": "sap/base/security/URLListValidator",
            "functionName": "clear",
            "version": "^1.85.0"
        }
    }
}
```

