import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync as readFile } from "node:fs";

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const https = {
    key: readFile(join(__dirname, ".cert/key.pem")),
    cert: readFile(join(__dirname, ".cert/cert.pem")),
};

export default defineConfig({
    plugins: [react()],
    server: {
        https,
        host: "0.0.0.0",
        port: 5173,
        proxy: {
            "/api": {
                target: "https://localhost:9443",
                changeOrigin: true,
                secure: false
            }
        }
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/setupTests.js",
        coverage: {
            reporter: ["text", "json", "html"],
        },
    },
});
