const {fsReadDir, fsReadFile, fsWriteFile} = require("../../js/util/FileUtils");
const path = require("path");
const handlebars = require("handlebars");
const helperMarkdown = require("helper-markdown");

const sThemeDir = path.join(require.resolve("typedoc-default-themes"), "..", "default");
const sPartialsDir = path.join(sThemeDir, "partials");
const sLayoutPath = path.join(sThemeDir, "layouts", "default.hbs");

// Register helpers
handlebars.registerHelper("markdown", helperMarkdown());
handlebars.registerHelper("wbr", (obj) => new handlebars.SafeString(obj));
handlebars.registerHelper("relativeURL", (obj) => path.normalize(path.posix.join("..", "typedoc", obj)));
handlebars.registerHelper("compact", function(obj) {
	return obj.fn(this);
});
handlebars.registerHelper("ifCond", function(left, op, right, opts) {
	let condValue = false;
	switch (op) {
	case "==":
		condValue = left == right;
		break;
	}

	if (condValue) {
		opts.fn(this);
	} else {
		opts.inverse(this);
	}
});

// The templates
const fnTemplate = handlebars.compile(
	"<div class=\"tsd-panel tsd-typography\">\n" +
	"	{{#markdown}}{{{markdownSource}}}{{/markdown}}\n"+
	"</div>"
);
let fnLayout = null;

Promise.resolve()
	// Register partials
	.then(fsReadDir(sPartialsDir)
		.then((filenames) => filenames.map(
			(filename) => fsReadFile(path.join(sPartialsDir, filename), "utf8")
				.then((content) => handlebars.registerPartial(filename.slice(0, -4), content))
		))
	)

	// Load layout
	.then(fsReadFile(sLayoutPath, "utf8").then((content) => fnLayout = handlebars.compile(content)))

	// Process markdown files
	.then(fsReadDir(__dirname)
		.then((files) => Promise.all(["../../README.md"].concat(files)
			// Load all markdown files and preprocess them
			.filter((filename) => filename.endsWith(".md"))
			.map((filename) => fsReadFile(path.join(__dirname, filename), "utf8")
				.then((markdownSource) => {
					// Extract title from markdown
					let titleResults = /^# (.+)$/m.exec(markdownSource);
					let title = filename.slice(0, -3);
					if (titleResults) {
						title = titleResults[1];
						markdownSource = markdownSource.substr(titleResults[0].length).trimLeft();
					}

					return {
						filename,
						title,
						markdownSource,
						url: path.basename(filename, ".md") + ".html"
					};
				})
			))

			// Render markdown to fully-processed html file
			.then((files) => files.map((curFile) => {
				let htmlSource = fnLayout({
					contents: fnTemplate({
						markdownSource: curFile.markdownSource
					}),
					model: {
						name: curFile.title,
						kindString: ""
					},
					project: {
						name: "ui5-migration"
					},
					settings: {
						hideGenerator: true,
						excludeExternals: true,
						excludeNotExported: true
					},
					toc: {
						children: files.map((tocFile) => ({
							isInPath: curFile === tocFile,
							title: tocFile.title,
							url: path.posix.join("..", "guide", tocFile.url),
							cssClasses: "tsd-kind-variable"
						})).concat([{
							isInPath: false,
							title: "API Reference",
							url: "../typedoc/index.html",
							cssClasses: "tsd-kind-module"
						}])
					}
				});

				return fsWriteFile(path.join(__dirname, curFile.url), htmlSource);
			}))
		)
	);

process.on("unhandledRejection", (reason) => {
	throw reason;
});
