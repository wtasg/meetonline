
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = resolve(__dirname, "../../");
const UPLOAD_DIR = join(ROOT_DIR, "uploads");
const CERTS_DIR = join(ROOT_DIR, "certs");

function setupDirectories({ exists, mkdir }) {
    try {
        const directories = [UPLOAD_DIR, CERTS_DIR];

        directories.forEach((dir) => {
            if (!exists(dir)) {
                mkdir(dir, { recursive: true });
                console.log(`[setupDirectories] Created directory: ${dir}`);
            }
        });
    } catch (error) {
        console.error("[setupDirectories] Error creating directories:", error.message);
        throw error;
    }
}

export { UPLOAD_DIR, CERTS_DIR, setupDirectories };
