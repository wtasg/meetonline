import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: {
            globals: { ...globals.node, ...globals.jasmine },
            sourceType: "module"
        },
        rules: {
            semi: ["error", "always"],
            "no-extra-semi": "error",
            "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
        }
    }
]);
