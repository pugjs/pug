const { CLIEngine } = require('eslint');
const fs = require('fs');

const options = {
  useEslintrc: true,
  ignorePattern: [
    '!.eslint.js',
    'packages/pug/test/output/*',
    'packages/pug/test/output-es2015/*',
    'packages/pug/test/cases/*',
    'packages/pug/test/cases-es2015/*',
    'packages/pug/test/temp/*'
  ]
};
const fix = process.argv.includes('--fix');
if (fix) {
  options.fix = true;
}
const cli = new CLIEngine(options);

const report = cli.executeOnFiles([
  '.eslint.js',
  'packages/pug/lib/*.js',
  'packages/pug/test/**/*.js',
  'packages/pug-attrs/index.js',
  'packages/pug-attrs/test/*.js',
  'packages/pug-code-gen/index.js',
  'packages/pug-error/index.js',
  'packages/pug-filters/index.js',
  'packages/pug-filters/lib/*.js',
  'packages/pug-filters/test/*.js',
  'packages/pug-lexer/index.js',
  'packages/pug-lexer/test/*.js',
  'packages/pug-linker/index.js',
  'packages/pug-linker/test/*.js',
  'packages/pug-load/index.js',
  'packages/pug-load/test/*.js',
  'packages/pug-parser/index.js',
  'packages/pug-parser/lib/*.js',
  'packages/pug-parser/test/*.js',
  'packages/pug-runtime/index.js',
  'packages/pug-runtime/build.js',
  'packages/pug-runtime/wrap.js',
  'packages/pug-runtime/prepublish.js',
  'packages/pug-runtime/test/*.js',
  'packages/pug-strip-comments/index.js',
  'packages/pug-strip-comments/test/*.js',
  'packages/pug-walk/index.js',
  'packages/pug-walk/test/*.js'
]);

if (fix) {
  CLIEngine.outputFixes(report);
}

const formatter = cli.getFormatter();
console.log(formatter(report.results));
process.exit(0);
