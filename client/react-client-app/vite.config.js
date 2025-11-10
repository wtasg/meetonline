import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";

export default defineConfig({
    plugins: [react()],
    server: {
        https: {
            key: fs.readFileSync("../certs/server.key"),
            cert: fs.readFileSync("../certs/server.cert"),
        },
        host: true,
        port: 5173,
        proxy: {
            "/api": {
                target: "https://server:9443",
                secure: false,
            },
        },
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
