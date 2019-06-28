![UI5 logo](./docs/images/UI5_logo_wide.png)

# ui5-migration
Tooling to support the migration of UI5 projects by adapting your code for new UI5 framework versions.

The UI5 migration tool performs source code replacements and optimizations to improve a UI5 project's codebase.
The source code modification aims to reduce deprecated API and to leverage best practices.
It uses AST-parsing (recast, esprima) of JavaScript sources to perform code replacements.
Migration consists of an analysis part and a code modification part.

Next to the standalone CLI command an add'tl API is provided, which simplifies integration into other tools (e.g. into custom node.js scripts, grunt).

IMNPORTANT: The modified source code needs to be manually reviewed and tested. There is no 100% guarantee that the modified code works as expected.

**If you want to migrate your codebase, please see the [migration guide](./docs/guide/migrationguide.md)**


## Installation

Run the following command to delete the previous installation to avoid conflicts
```cli
npm uninstall ui5-migration --global
```

The migration tool is currently available for experimental usage. It can be installed with npm.
```cli
npm install ui5-migration --global
```

## Usage
### CLI
Execute migration for the current folder:
```cli
ui5-migration migrate
```

Currently the CLI is the easiest way to use the ui5-migration tool. Please see [command-line interface](./docs/guide/cli.md) for more details.

### API
The ui5-migration API might be consumed as in the following:

```js
var ui5Migration = require('ui5-migration');
var mySourceCode = "mysourceCodeString";
var aTasks = undefined;
var migrationResult = await ui5Migration.migrateString(aTasks, mySourceCode);
var log = migrationResult.log;
var myModifiedSourceCode = migrationResult.output;
```


### Available migration tasks
A list of the current migration tasks can be found [here](./docs/guide/tasks.md)

### Available migration output printing options
A list of the printing options can be found [here](./docs/guide/print.md)

## FAQ
### How can I contribute?
Please check our [Contribution Guidelines](https://github.com/SAP/ui5-migration/blob/master/CONTRIBUTING.md).

## Contributing
Please check our [Contribution Guidelines](https://github.com/SAP/ui5-migration/blob/master/CONTRIBUTING.md).

## Support
Please follow our [Contribution Guidelines](https://github.com/SAP/ui5-migration/blob/master/CONTRIBUTING.md#report-an-issue) on how to report an issue.

## License
This project is licensed under the Apache Software License, Version 2.0 except as noted otherwise in the [LICENSE](https://github.com/SAP/ui5-migration/blob/master/LICENSE.txt) file.
