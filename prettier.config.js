module.exports = {
  trailingComma: 'es5',
  bracketSpacing: true,
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  arrowParens: 'always',
  printWidth: 120,
  overrides: [
    {
      files: 'Routes.*',
      options: {
        printWidth: 999,
      },
    },
  ],
}
