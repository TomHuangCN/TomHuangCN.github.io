import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "*.min.js",
      "*.bundle.js",
      "pnpm-lock.yaml",
      "package-lock.json",
      "yarn.lock",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        __REACT_DEVTOOLS_GLOBAL_HOOK__: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      "@typescript-eslint": tseslint,
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...prettierConfig.rules,
      "prettier/prettier": "error",
      semi: ["error", "always"], // 强制要求分号
      "react/react-in-jsx-scope": "off",
      // "react/prop-types": "off", // 在TypeScript项目中关闭prop-types检查
      // "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      // "no-undef": "off", // TypeScript会处理这个
      // "@typescript-eslint/no-unused-expressions": "off", // 关闭这个规则，因为它会产生太多误报
      // "no-cond-assign": "off", // 关闭这个规则
      // "no-fallthrough": "off", // 关闭这个规则
      // "no-empty": "off", // 关闭这个规则
      // "no-useless-escape": "off", // 关闭这个规则
      // "no-constant-condition": "off", // 关闭这个规则
      // "no-prototype-builtins": "off", // 关闭这个规则
      // "no-control-regex": "off" // 关闭这个规则
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
