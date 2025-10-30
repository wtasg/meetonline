import { config as dotenvConfig } from 'dotenv';
import { dirname, resolve } from 'path';
import { existsSync, readdirSync as nodeReadDir } from 'node:fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
    const envRel = `../../${process.env.NODE_ENV === 'production' ? '.env' : 'local.env'}`;
    const envPath = resolve(__dirname, envRel);

    console.log({ envRel, envPath });
    console.log(nodeReadDir(resolve(__dirname, "../../")));

    if (!existsSync(envPath)) {
        console.error(`Environment file not found at path: ${envPath}`, { envRel, envPath });
    }

    dotenvConfig({ path: envPath });
}

export  { loadEnv };
