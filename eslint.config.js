import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "**/*.min.*"
    ]
  },
  // JS and config files (no type-checking)
  {
    files: ["**/*.{js,mjs,cjs}"] ,
    extends: [js.configs.recommended],
    languageOptions: {
      sourceType: "module",
      ecmaVersion: 2024,
      globals: { ...globals.browser, ...globals.node }
    }
  },
  // TypeScript source with type-aware rules
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        allowDefaultProject: true,
        tsconfigRootDir: process.cwd(),
        ecmaFeatures: { jsx: true }
      },
      sourceType: "module",
      ecmaVersion: 2024,
      globals: { ...globals.browser, ...globals.node }
    },
    settings: { react: { version: "detect" } },
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true }
      ]
    }
  }
);


