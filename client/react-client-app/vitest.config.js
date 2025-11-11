import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        exclude: ["**/node_modules/**", "**/dist/**", "**/tests/**"],
        environment: "jsdom",
        globals: true,
        setupFiles: "./src/setupTests.js",
        environmentOptions: {
            jsdom: {
                resources: "usable",
            },
        },
    },
    esbuild: {
        jsx: "automatic",
        jsxImportSource: "react",
    },
});
