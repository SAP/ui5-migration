const gtsPrettier = require('gts/.prettierrc.json');


module.exports = Object.assign({}, gtsPrettier, {
  tabWidth: 4,
  useTabs: true,
  printWidth: 80,
  singleQuote: false,
  bracketSpacing: false,
  endOfLine: "lf",
  trailingComma: 'es5',
});
