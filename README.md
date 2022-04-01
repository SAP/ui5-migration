![UI5 logo](./docs/images/UI5_logo_wide.png)

# ui5-migration
> Tooling to support the migration of UI5 projects by adapting code for new UI5 framework versions.

[![REUSE status](https://api.reuse.software/badge/github.com/SAP/ui5-migration)](https://api.reuse.software/info/github.com/SAP/ui5-migration)
[![Build Status](https://dev.azure.com/sap/opensource/_apis/build/status/SAP.ui5-migration?branchName=master)](https://dev.azure.com/sap/opensource/_build/latest?definitionId=41&branchName=master)
[![npm version](https://badge.fury.io/js/%40ui5%2Fmigration.svg)](https://www.npmjs.com/package/@ui5/migration)

_**Note:** This project is currently in beta. While there are ongoing improvements and round-offs being applied, we see the early release as a great opportunity to collect feedback from the community to further advance the UI5 migration tooling._

The UI5 migration tool is node.js-based and performs source code replacements and optimizations, reducing or getting rid of deprecated API. It builds upon a powerful parsing of JavaScript sources into an AST (abstract syntax tree) in order to perform the actual code replacements. Migration typically consists of an analysis part and a code modification part.

**IMPORTANT**: The modified source code needs to be manually reviewed and thoroughly tested. There is no 100% guarantee that the modified code works as expected.

**For more details on how-to migrate your project's codebase, please consult additional information such as the [migration guide](./docs/guide/migrationguide.md)**


## Installation

### Requirements
- [Node.js](https://nodejs.org/) (**version 14 or higher** ⚠️)

The migration tool is currently available for early usage. It can be installed with npm.
```cli
npm install --global @ui5/migration
```

## Usage
### CLI

To verify that the installation worked, run:
```cli
ui5-migration --help
```

Execute migration for the current folder:
```cli
ui5-migration migrate
```

Please see [command-line interface](./docs/guide/cli.md) for more details.


### Available migration tasks
A list of currently available migration tasks can be found [here](./docs/guide/tasks.md)

### Formatting options
A list of options to configure the formatting of migration output can be found [here](./docs/guide/print.md)

## Contributing
Please check our [Contribution Guidelines](https://github.com/SAP/ui5-migration/blob/master/CONTRIBUTING.md). Your input and support is welcome!

## Support
Please follow our [Contribution Guidelines](https://github.com/SAP/ui5-migration/blob/master/CONTRIBUTING.md#report-an-issue) on how to report an issue.
