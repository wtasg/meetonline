import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync as readFile } from "node:fs";

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import process from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const https = {
    key: readFile(join(__dirname, ".cert/key.pem")),
    cert: readFile(join(__dirname, ".cert/cert.pem")),
};

config({ path: `${__dirname}/${process.env.VITE_ENV_FILE}`, quiet: true });

export default defineConfig({
    define: {
        "process.env.VITE_ENV_FILE": JSON.stringify(process.env.VITE_ENV_FILE)
    },
    clearScreen: false,
    plugins: [
        react(),
        {
            name: "print-custom-url",
            configureServer(server) {
                server.httpServer?.on("listening", () => {
                    setTimeout(() => {
                        console.log("  ➜  Local:   https://meet.online:5173/");
                    }, 100);
                });
            },
        },
    ],
    server: {
        host: "0.0.0.0",
        hmr: {
            host: "meet.online",
        },
        https,
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/setupTests.ts",
        coverage: {
            reporter: ["text", "json", "html"],
        },
    },
});
