![UI5 logo](./docs/images/UI5_logo_wide.png)

# ui5-migration
> Tooling to support the migration of UI5 projects by adapting your code for new UI5 framework versions.

_**Note:** This project is currently in beta and in the process to become available via npm. While there are ongoing improvements and round-offs being applied to this project, we see the upcoming release as a great opportunity to collect feedback from the community to further advance the UI5 migration tooling. Appreciated._

The UI5 migration tool performs source code replacements and optimizations to improve a UI5 project's codebase.
The source code modification aims to reduce deprecated API and to leverage best practices.
It uses AST-parsing (recast, esprima) of JavaScript sources to perform code replacements.
Migration consists of an analysis part and a code modification part.

Next to the standalone CLI command an add'tl API is provided, which simplifies integration into other tools (e.g. into custom node.js scripts, grunt).

**IMPORTANT**: The modified source code needs to be manually reviewed and tested. There is no 100% guarantee that the modified code works as expected.

**If you want to migrate your codebase, please see the [migration guide](./docs/guide/migrationguide.md)**


## Installation

### Requirements
- [Node.js](https://nodejs.org/) (**version 8.5 or higher** ⚠️)

The migration tool is currently available for experimental usage. It can be installed with npm.
```cli
npm install --global @ui5/migration
```

## Usage
### CLI

To verify that the installation worked run:
```cli
ui5-migration --help
```

Execute migration for the current folder:
```cli
ui5-migration migrate
```

Please see [command-line interface](./docs/guide/cli.md) for more details.


### Available migration tasks
A list of the current migration tasks can be found [here](./docs/guide/tasks.md)

### Printing options for migration output
A list of the printing options can be found [here](./docs/guide/print.md)

## Contributing
Please check our [Contribution Guidelines](https://github.com/SAP/ui5-migration/blob/master/CONTRIBUTING.md).

## Support
Please follow our [Contribution Guidelines](https://github.com/SAP/ui5-migration/blob/master/CONTRIBUTING.md#report-an-issue) on how to report an issue.

## License
This project is licensed under the Apache Software License, Version 2.0 except as noted otherwise in the [LICENSE](https://github.com/SAP/ui5-migration/blob/master/LICENSE.txt) file.
