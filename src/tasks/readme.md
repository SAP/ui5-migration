# About

This package contains tasks.
A task is a procedure which can be executed by the migration tooling and operates on the contents of a source file.
The content is parsed into an AST and passed to the task.
It is used to:
* `analyze`: checks the AST and gathers findings and creates an analysis
* `migrate`: works on the analysis of the AST and modifies it

# Contents

It contains Task classes implementing the `Task` interface.

## Naming convention

There is currently no consistent naming convention in place.

## SubFolders

* `helpers` - contain the helpers used to separate the logic of the tasks into separate modules