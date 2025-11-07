import { Pool } from "pg";

let pool = null;

async function dbStart() {
    const config = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    };

    if (pool === null) {
        pool = new Pool(config);
    } else {
        return pool;
    }

    pool.on("error", (err) => {
        console.error({ err });
        process.exit(1);
    });

    try {
        const client = await pool.connect();
        console.log("DB connected.");
        client.release();
        return pool;
    } catch (err) {
        console.error({ err });
        process.exit(1);
    }
}

async function dbClose() {
    try {
        if (pool && !pool.ended && !pool.ending) {
            await pool.end();
            console.log("DB Disconnected.");
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export { dbStart, pool, dbClose };
