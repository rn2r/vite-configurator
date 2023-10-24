module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.eslintrc.js',
    'commitlint.config.js',
    'lint-staged.config.js',
    'prettier.config.js',
    'jest.config.js',
  ],
  rules: {
    'import/prefer-default-export': 0,
    'import/order': 0,
    'class-methods-use-this': 0,
    'no-restricted-syntax': 0,
    'no-continue': 0
  },
};
