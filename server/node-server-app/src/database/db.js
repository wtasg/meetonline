import { config as dotenvConfig } from 'dotenv';
import { dirname, resolve } from 'path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envRel = process.env.NODE_ENV === 'production' ? '../../.env' : '../../local.env';
const envPath = resolve(__dirname, envRel);

// console.log({ envPath });

if (!existsSync(envPath)) {
    throw new Error(`Environment file not found at path: ${envPath}`);
}
dotenvConfig({ path: envPath });

const config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

const pool = new Pool(config);
pool.on('error', (err) => {
    console.error(err);
    process.exit(-1);
});

pool.connect()
    .then((client) => {
        console.log("DB connected.");
        client.release();
    }).catch(console.error);

async function dbClose() {
    try {
        if (!pool.ended && !pool.ending) {
            await pool.end();
        }
        console.log("DB Disconnected.");
    } catch (err) {
        console.error(err);
    }
}

export { pool, dbClose };
