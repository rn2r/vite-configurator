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
    extends: [
      'airbnb-base',
      'airbnb-typescript/base',
      'prettier',
    ],
    ignorePatterns: ["node_modules/", "dist/", ".eslintrc.js", "commitlint.config.js", "lint-staged.config.js", "prettier.config.js"],
    rules: {
      "import/prefer-default-export": 0,
    },
};
