import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import vitestGlobals from 'eslint-plugin-vitest-globals';


export default defineConfig([
    globalIgnores(['dist', "coverage"]),
    {
        files: ['**/*.{js,jsx}'],
        extends: [
            js.configs.recommended,
            // reactHooks.configs['recommended-latest'],
            reactRefresh.configs.vite,
        ],
        plugins: {
            "vitest-globals": vitestGlobals,
            reactHooks: reactHooks
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...vitestGlobals.environments.env.globals,
            },
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        rules: {
            semi: ["error", "always"],
            'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
        },
    },
]);
