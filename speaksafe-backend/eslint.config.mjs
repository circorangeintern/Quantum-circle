import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,

  prettier,

  {
    files: ["**/*.ts"],

    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },

      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    rules: {
      "@typescript-eslint/no-explicit-any": "warn",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/no-floating-promises": "error",

      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],

      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],

      eqeqeq: ["error", "always"],

      curly: ["error", "all"],

      "prefer-const": "error",
    },
  },

  {
    files: ["tests/**/*.ts"],

    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  {
    ignores: ["dist/", "coverage/", "node_modules/"],
  },
];
