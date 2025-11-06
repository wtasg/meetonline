import { join } from "node:path";

import { projectRoot } from "./projectRoot.js";

const UPLOAD_DIR = join(projectRoot, "uploads");
const CERTS_DIR = join(projectRoot, "certs");

/**
 * Generates directories for server
 * @param {{exists: Function, mkdir: Function}} dependencies
 */
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
