module.exports = {
  arrowParens: 'avoid',
  bracketSameLine: true,
  bracketSpacing: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 140,
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'auto',
  vueIndentScriptAndStyle: true,
  htmlWhitespaceSensitivity: 'strict',
  semi: false,
  jsxSingleQuote: true,
  overrides: [
    {
      files: '*.ts',
      options: {
        parser: 'typescript',
      },
    },
  ],
}
