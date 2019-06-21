#!/usr/bin/env node
var CLI = require("../js/src/cli");

process.on("unhandledRejection", (reason, p) => {
	console.log("Unhandled Rejection at:", p, "reason:", reason);
});

CLI.start().catch((err) => {
	throw err;
});
