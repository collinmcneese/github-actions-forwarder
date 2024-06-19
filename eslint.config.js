const js = require('@eslint/js');

module.exports = [
  {
    ignores: ['__test__/**/*', 'dist/**/*', 'node_modules/**/*'],
  },
  {
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'commonjs',
    },
  },
  js.configs.recommended,
  {
    rules: {
      semi: "error",
      "prefer-const": "error"
    }
  }
];
