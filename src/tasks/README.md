# About

This package contains tasks.
A task is a procedure which can be executed by the migration tooling and operates on the contents of
a source file.
The content is parsed into an AST and passed to the task.
It performs the following actions in order:
* `analyze`: checks the AST, gathers findings and creates an analysis
* `migrate`: works on the analysis of the AST and modifies it

# Contents

It contains classes implementing the `Task` interface.
* `addMissingDependencies`: find in the ast code for which the dependency is missing in the
`sap.ui.define`/`sap.ui.require` dependencies array. Very dynamic approach based on configuration
  of:
  * `finders` (scans the AST and looks for findings)
  * `replacers` (modifies the AST for a given finding)
  * `extenders` (manages the dependencies in the `sap.ui.define`/`sap.ui.require` call)
  
  Can be used when the replacement is more complex.
* `addRenderers`: checks Control classes and adds the respective Renderer dependency if missing.
* `amdCleanup`: checks the AMD syntax of a source file and if none was found it wraps all code
  inside a new sap.ui.define call.
  This task runs in the beginning before all other tasks (high priority), because the AMD syntax is
  required for the dependency handling.
* `fixTypeDependency`: Scans the code for the usage of Types, which are defined in the library and
  adds a dependency to the library and references the type.
* `replaceGlobals`: Scans the code for global function calls, e.g. `jQuery.sap.log(...)` and
  replaces these by the respective module call.
  Only the AST replacement can be modified via configuration.
* `variableNamePrettifier`: Scans the newly introduced variables (from dependencies) and cleans them
  up. During replacements there can be variable name conflicts, to resolve these the variable names
  are made unique by appending a number,
  e.g. `jQuery` and `jQuery0`. After all tasks were run `jQuery0` could remain solely.
  This task will replace `jQuery0` with `jQuery`.
  It runs after all other tasks (low priority).

## Naming convention

There is currently no consistent naming convention in place.

## SubFolders

* `helpers` - contain the helpers used to separate the logic of the tasks into separate modules