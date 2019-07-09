# Commandline-Interface (CLI)

An overview of the cli commands will be printed by executing
```shell
ui5-migration --help
```

## Usage

```shell
ui5-migration [command] [input-paths] [options]
```

```[command]``` can be either `analyze` (performs an analysis without modifying the source code) or `migrate` (performs an analysis and afterwards modifies the source code)

```[input-paths]``` is a set of files to be migrated. By default the current folder is taken
Multiple paths need to be separated by spaces.

```[options]``` have to be named explicitly.

## Commands

### ```analyze```

The ```analyze``` command will exit with the following codes.

Exit Code 0:

* There are no findings

Exit Code 1:

* in case there are some findings
* No files are found

### ```migrate```

The ```migrate``` command will exit with the following codes.

Exit Code 0:

* There are no findings
* The migration has been performed successfully

Exit Code 1:

* No files are found

## Paths (input-paths)

Every path (input paths and exclude filters) can have one of the following structures:

- directory, e.g `src`, `src/my.library/`

### Example

Run all tasks in the current working directory and modify all affected files.

```shell
ui5-migration migrate
```

Run specific tasks in a provided folder.

```shell
ui5-migration migrate src/my.lib/ --task add-renderer-dependencies fix-jquery-plugin-imports
```

Run all tasks, exclude unit-test directory and only display outcome without modifying files.

```shell
ui5-migration migrate src/ --exclude-path src/qunit/ --dry-run
```

All paths are relative to the current working directory where the command is executed.
If no path is provided, the current working directory is taken as default path.

## Options

### Overview

Each option is prefixed with `--`, e.g. `--help`.

| Option name | Description              | Example | Default if omitted |
|:-----------:|:-------------------------|---------|---------|
| `help`| Displays the help screen | `--help` | not applicable |
| `exclude-path` | Directories to exclude. For defining exclude-path, please see [paths](#paths) definition. | `--exclude-path test/` | `"node_modules/**/*", "node_modules/**/.*", ".*"` |
| `output` |  Sets output folder for migrated files. | `--output migrated` | `"."`
| `task` | One or more specific migration tasks. | `--task replace-globals`, `--task 'fix-type-dependencies' fix-imports` | `"all"` |
| `target-version` | Specifies target version to execute only supported migration scripts | `--target-version=1.58.0` | `"latest"` |
| `output-format` | Specifies target json file which holds the options | `--output-format=custom.json` | [predefined](./print.md) |
| `ignore-file` | Specifies target ignore file which can be used to ignore files | `--ignore-file=.myignore` | `".gitignore"` |

### Exclude

Similar to the include paths, it is possible to exclude files or paths from the migration process with `--exclude-path`.
The exclude path is stronger than the input paths and previous included paths or files may be excluded.
Multiple paths are also supported and are whitespace separated.

Note: If omitted, the default is `"node_modules/**/*", "node_modules/**/.*", ".*"` (`node_modules` folder and hidden files prefixed with dot, e.g. `.myFile` are excluded).

#### Example for excluding files

```shell
ui5-migration migrate src/my.application/ --exclude-path test/
```

### Tasks

 With the option `--task` it is possible to run a single specific task or a space separated list of tasks.
 If this option isn't provided, all tasks will be executed.

A list of the current migration tasks can be found [here](./tasks.md).


### Target Version

Migration tooling takes by default predefined config files for execution. Some of the replacements are only supported in newer UI5 versions e.g. 1.58.x and older. If migration tooling is executed without a specific version, then all migration scripts are used which could lead to side effects. Therefore it's recommended to define the target version.

For example:

```shell
ui5-migration migrate src/**/* --target-version=1.58.0
```


#### Example for defining tasks

```shell
ui5-migration migrate --task replace-globals
```

```shell
ui5-migration migrate --task add-renderer-dependencies fix-jquery-plugin-imports
```

### Output Format

With the option `--output-format` a json file can be specified which defines the printing options.

A list of the current migration output format can be found [here](./print.md).


### Ignore File

With the option `--ignore-file` an ignore file can be specified. Entries within this ignore file are ignored.

Note: If omitted, the default is `.gitignore` ([gitignore](https://git-scm.com/docs/gitignore)).

