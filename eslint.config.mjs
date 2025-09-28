import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import nextPlugin from "@next/eslint-plugin-next";

const eslintConfig = [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      react,
      "react-hooks": reactHooks,
      "@next/next": nextPlugin,
    },
    rules: {
      // Next.js rules
      ...nextPlugin.configs.recommended.rules,

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",

      // React rules
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/prop-types": "off", // Using TypeScript
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // General rules
      "no-console": "warn",
      "no-unused-vars": "off", // Using TypeScript version instead
      "prefer-const": "error",
      "no-var": "error",
      "no-undef": "off", // TypeScript handles this
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
