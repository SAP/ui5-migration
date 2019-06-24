# Available migration tasks

The following tasks can be specified when running the migration. If omitted all tasks are run.

| Name | Description |
|:----:|-------------|
| `fix-jquery-plugin-imports` | Checks usage of jQuery function extensions and ensures module imports are correct. By doing so, it might add unused dependencies, as the jquery modules might extend prototypes and/or introduce globals as a sideeffect.|
| `add-renderer-dependencies` | Checks whether a control renderer is present, but not explicitly given as a dependency of the control module. This is possible, but is considered bad practice. If a renderer is found, the migration step adds the explicit dependency to the `sap.ui.define` call. |
| `apply-amd-syntax` | Finds global Component usage and requires it instead. Additionally old module declarations are found and replaces by new AMD syntax. By doing so, it might add unused dependencies. |
| `fix-type-dependencies` | Finds invalid dependencies of library types and replaces these with respective library dependency. The type is then accessed via library variable. |
| `replace-globals` | Finds calls to global variables and attempts to replace them with the newer alternatives if possible. This module will not replace calls if the change is not fully compatible. |