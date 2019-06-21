# Doc-Generation

ui5-migration uses an elaborate documentation generator. It consists out of three steps:

## Guide generator

The guide generator is a node.js script located at `docs/guide/guide.js`. It uses the handlebars templates of typedoc to generate these guide files. As source it takes the `README.md` file from the repo root folder and the markdown files in the `docs/guide/` folder. 

## Typedoc

Typedoc is used to generate the API reference with the Typescript source files. It uses a custom `tsconfig.json` file to also include the declaration files (e.g. `typings/index.d.ts`). Without that extra file, the reference would not be complete.

## Coverage

The NPM package `nyc` is used to measure the code coverage during the unit tests and generate the HTML report. 
