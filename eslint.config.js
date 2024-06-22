import js from "@eslint/js";

export default [
  {
    ignores: ['__test__/**/*', 'dist/**/*', 'node_modules/**/*'],
  },
  {
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
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
