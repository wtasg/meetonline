import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// NOTE: double dots are safer way to access directories in a platform independent way.
// Windows: `\` vs UNIX: `/`
const projectRoot = join(__dirname, "..", "..");

export { projectRoot };
