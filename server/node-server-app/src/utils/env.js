import { config as dotenvConfig } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { exit } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Loads correct environment file based on current stage of execution.
 *
 * @param {string} stage
 */
function loadEnv(stage = "development") {
    const envRel = `../../${stage === 'production' ? '.env' : 'local.env'}`;

    try {
        const envPath = resolve(__dirname, envRel);

        if (!existsSync(envPath)) {
            console.error(`Environment file not found at path: ${envPath}`, { envRel, envPath });
        }

        dotenvConfig({ path: envPath });
        return { envRel, envPath };
    } catch (e) {
        console.error(`EXITING: ${e}`);
        exit(1);
    }
}

export { loadEnv };
