# About

This package contains tasks.
A task is a procedure which can be executed by the migration tooling and operates on the contents of
a source file.
The content is parsed into an AST and passed to the task.
It performs the following tasks in order:
* `analyze`: checks the AST, gathers findings and creates an analysis
* `migrate`: works on the analysis of the AST and modifies it

# Contents

It contains Task classes implementing the `Task` interface.
* `addMissingDependencies`: find in the ast code usage where the dependency is missing from the
`sap.ui.define`/`sap.ui.require` dependencies array. Very dynamic approach based on configuration
  of:
  * `finders` (scans the AST and looks for findings)
  * `replacers` (modifies the AST for a given finding)
  * `extenders` (manages the dependencies in the `sap.ui.define`/`sap.ui.require` call)
  
  Is used when the replacement is more complex and not a straight forward way,
  e.g. such as a renaming or a simple global-call with module call replacement.
* `addRenderers`: checks controls and adds a missing Renderer dependency if required.
  Is limited to controls and their renderers
* `amdCleanup`: checks the AMD syntax and if none found wraps all code inside a new sap.ui.define
  call. Runs in the beginning before all other tasks (high priority), because the AMD syntax is
  required for the dependency handling.
* `fixTypeDependency`: Scans the code for the usage of types, which are defined in the library and
  adds a dependency to the library and references the type.
* `replaceGlobals`: Scans the code for global function calls, e.g. `jQuery.sap.log(...)` and
  replaces these by a module call.
  It handles the dependency and is semi-flexible, which means the dependency handling is static and
  the replacements are typical module replacements, but also more complex replacements can be
  performed.
* `variableNamePrettifier`: Scans the newly introduced variables (from dependencies) and cleans them
  up, if there were naming conflicts variable names are made unique by appending a number,
  e.g. `jQuery` and `jQuery0` and when after all tasks were run `jQuery0` remains solely,
  this task will replace it with `jQuery`.
  It runs after all other tasks (low priority).

## Naming convention

There is currently no consistent naming convention in place.

## SubFolders

* `helpers` - contain the helpers used to separate the logic of the tasks into separate modules