import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";

const key = fs.readFileSync("./certs/server.key");
const cert = fs.readFileSync("./certs/server.crt");

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        https: { key, cert },
        port: 5173,
        proxy: {
            "/api": {
                target: "https://localhost:9443",
                changeOrigin: true,
                secure: false,
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
