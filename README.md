# ui5-migration
Tooling to support the migration of UI5 applications to adopt your code to the new UI5 framework versions.

The UI5 migration tool is a collection of migration scripts used to improve the UI5 codebase.
These scripts use AST-parsing (recast, esprima) of javascript sources and perform code replacements based on the configured migration tasks.
The migration consists of an analysis part and a code modification part.
The code modification is optional.
An API is provided which simplifies integration into other tools (e.g. custom node scripts, grunt) next to the standalone CLI.

**If you want to migrate your codebase, please see the [migration guide](./docs/guide/migrationguide.md)**


## Installation

Run the following command to delete the previous installation to avoid conflicts
```cli
npm uninstall ui5-migration --global
```

The migration tool is currently available for internal usage only. It can be installed with npm.
```cli
npm install ui5-migration --global
```

## Usage
### CLI
Executes the migration for the current folder
```cli
ui5-migration migrate
```

Currently the CLI is the most easiest way to use the ui5-migration tool. Please see [command line interface](./docs/guide/cli.md) for more information.

### API
The migration tool can be imported as npm package (although currently not uploaded to the npm registry), a complete reference of the API can be found [on this site](../typedoc/index.html).
That being said, to use the API you would most likely have to implement a few interfaces, as this tool is supposed to work with every environment.

If you want to throw a lot of files against the migration tasks, it might be useful to use a single [ASTVisitor](../typedoc/classes/_ui5_evo_migration_.astvisitor.html) instance, which you can give as parameter to the task module.

### Available migration tasks
A list of the current migration tasks can be found [here](./docs/guide/tasks.md)

### Available migration output printing options
A list of the printing options can be found [here](./docs/guide/print.md)

## FAQ
### How can I contribute?
Please check our [Contribution Guidelines](https://github.com/SAP/ui5-migration/blob/master/CONTRIBUTING.md).

### How can I obtain support?
Please follow our [Contribution Guidelines](https://github.com/SAP/ui5-migration/blob/master/CONTRIBUTING.md#report-an-issue) on how to report an issue.

## Contributing
Please check our [Contribution Guidelines](https://github.com/SAP/ui5-migration/blob/master/CONTRIBUTING.md).

## Support
Please follow our [Contribution Guidelines](https://github.com/SAP/ui5-migration/blob/master/CONTRIBUTING.md#report-an-issue) on how to report an issue.

## License
This project is licensed under the Apache Software License, Version 2.0 except as noted otherwise in the [LICENSE](https://github.com/SAP/ui5-migration/blob/master/LICENSE.txt) file.
