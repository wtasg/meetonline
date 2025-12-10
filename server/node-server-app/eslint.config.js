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
            "@stylistic/indent": ["error", 4],
            "@stylistic/quotes": ["error", "double"],
            "no-extra-semi": "error",
            "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
            "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
            "object-curly-spacing": ["error", "always"],
            "semi": ["error", "always"],
        }
    }
]);
