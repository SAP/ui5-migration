# RFC 0001 Configurable console output

- Start Date: 2019-07-18
- RFC PR: [#42](https://github.com/SAP/ui5-migration/pull/42) 
- Issue: [#39](https://github.com/SAP/ui5-migration/issues/39)

## Summary

The output of the findings of a migration-run should be configurable. We want to support use-cases like machine-readability, summaries, eslint-like output. The final output should facilitate integration into CI environments.

## Motivation

See [Summary](#Summary).

The internal refactoring efforts should aim to support integration scenarios, where the output needs to be concise to minimize the time to identify/fix the problem.

## Detailed design

### Refactoring

In order to achieve an easy configuration and extension of the output, a deeper refactoring of the existing `Reporter` mechanism is required.

### Favor composition over inheritance

The current implementation is heavily using inheritance, which makes it rather rigid and inconvenient to extend/maintain.  

The new approach should be flexible and use composition instead of inheritance. We aim for better extensibility and maintainability.

### Single Responsibility Principle

The current concept makes the Reporters (`JSONReporter`, `ConsoleReporter` and `MetaConsoleReporter`) does too many things intermingled:

- collect Findings
- format output
- manage other reporters
- instantiate other reporters

We aim to break this feature *lump* down into classes with only one single responsibility.  
In the following [section](#Solution) we will explain our simplified class design.

### Solution

The following image shows our intended simplified class structure.

![concept](./../docs/images/ui5-migration-reporter-concept.png)

#### `Exporter`

`Exporter` is an interface.  
An `Exporter` is responsible for exporting the given findings. The findings will be exported in the format defined by the implementing class.  

We currently want to provide two predefined `Exporter` implementations:

1. `ConsoleExporter` (*implements `Exporter` interface*)  
Dumps content to the console in human readable format.

1. `JSONExporter` (*implements `Exporter` interface*)  
For automation and visualization purposes we also provide a JSON export.

#### `ReporterManager`

- The `ReporterManager` is a Singleton
- It serves as a `Reporter` factory and holds references on all instantiated Reporters.  
- In the future the `ReporterManager` also might implement grouping and filtering mechanisms on all retained `Reporter` instances to allow for eslint-like "per-file" output.  
- It uses then an `Exporter` instance for exporting the different findings.

#### `Reporter`

A `Reporter` collects findings and logs issued by the migration processors.

### Configuration

There should be a configuration option such that the user can configure the way the output is reported with option `--export`.

Currently the available export formats will be *console-logs* and *JSON*.

## Open Points

- Extend design to include the Migration `Task` class.  
  Show how the `Task` classes can create a new `Reporter` via the `ReporterManager` factory.
