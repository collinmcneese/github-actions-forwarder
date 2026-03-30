import js from "@eslint/js";

export default [
  {
    ignores: ['__test__/**/*', 'dist/**/*', 'node_modules/**/*'],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        fetch: 'readonly',
      },
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
