module.exports = {
  bracketSpacing: false,
  singleQuote: true,
  trailingComma: 'all',
  overrides: [
    {
      files: '*.js',
      options: {
        parser: 'babel',
        trailingComma: 'es5',
      },
    },
  ],
};
