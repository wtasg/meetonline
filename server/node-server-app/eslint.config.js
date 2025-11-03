import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"],
        plugins: {
            js,
            "@stylistic": stylistic
        },
        extends: ["js/recommended"],
        languageOptions: {
            globals: { ...globals.node, ...globals.jasmine, ...globals.jest },
            sourceType: "module"
        },
        rules: {
            semi: ["error", "always"],
            "no-extra-semi": "error",
            "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
            "@stylistic/indent": ["error", 4],
            "@stylistic/quotes": ["error", "double"],
        }
    }
]);
