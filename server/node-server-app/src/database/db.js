import { loadEnv } from '../utils/env.js';
import { Pool } from 'pg';

loadEnv(process.env.NODE_ENV);

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
