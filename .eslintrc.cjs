module.exports = {
  root: true,
  ignorePatterns: ['src/services/**', 'node_modules/**', 'dist/**', '__MACOSX/**'],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  globals: {
    uni: 'writable',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-essential',
    'plugin:prettier/recommended',
    'prettier',
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import', 'vue', 'prettier'],
  rules: {
    'vue/multi-word-component-names': 'off',
    quotes: ['error', 'single'],
    semi: [1, 'never'],
    'block-spacing': ['error', 'always'],
    'no-trailing-spaces': 'error',
    'object-curly-spacing': ['error', 'always'],
    'import/order': ['error'],
    'import/namespace': 0,
    '@typescript-eslint/no-unused-vars': ['warn', { vars: 'local' }],
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/triple-slash-reference': 0,
    'linebreak-style': [0, 'error', 'windows'],
  },
}
