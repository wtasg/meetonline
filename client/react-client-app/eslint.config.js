import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import vitestGlobals from "eslint-plugin-vitest-globals";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([
    globalIgnores(["dist", "coverage"]),
    {
        files: ["**/*.{js,jsx}"],
        extends: [
            js.configs.recommended,
            // reactHooks.configs['recommended-latest'],
            reactRefresh.configs.vite
        ],
        plugins: {
            "vitest-globals": vitestGlobals,
            reactHooks: reactHooks,
            "@stylistic": stylistic
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...vitestGlobals.environments.env.globals,
            },
            parserOptions: {
                ecmaVersion: "latest",
                ecmaFeatures: { jsx: true },
                sourceType: "module",
            },
        },
        rules: {
            "@stylistic/indent": ["error", 4],
            "@stylistic/quotes": ["error", "double"],
            "no-extra-semi": "error",
            "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
            "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
            "object-curly-spacing": ["error", "always"],
            "semi": ["error", "always"],
        },
    },
]);
