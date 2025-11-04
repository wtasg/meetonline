import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "../../");

const UPLOAD_DIR = path.join(ROOT_DIR, "uploads");
const CERTS_DIR = path.join(ROOT_DIR, "certs");

function setupDirectories() {
    try {
        const directories = [UPLOAD_DIR, CERTS_DIR];

        directories.forEach((dir) => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`[setupDirectories] Created directory: ${dir}`);
            }
        });
    } catch (error) {
        console.error("[setupDirectories] Error creating directories:", error.message);
        throw error;
    }
}

export { UPLOAD_DIR, CERTS_DIR, setupDirectories };