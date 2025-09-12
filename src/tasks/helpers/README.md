# About

This package contains helper functions for tasks grouped by:
* extenders - used by `addMissingDependencies` and `variableNamePrettifier`
* finders - used by `addMissingDependencies` and `variableNamePrettifier`
* replacers - used by `addMissingDependencies`, `variableNamePrettifier` and `replaceGlobals`

# Contents


## Naming convention

There is currently no consistent naming convention in place.

## SubFolders

* extenders - modifies the SapUiDefineCall
* finders - checks the AST and returns if something was found
* replacers - modifies the AST