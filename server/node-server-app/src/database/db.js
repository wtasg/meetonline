import { Pool } from "pg";

let pool = null;

function dbStart() {
    const config = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    };

    if (pool === null) {
        pool = new Pool(config);
        if(!pool) {
            process.exit(1);
        }
    } else {
        return pool;
    }

    pool.on("error", (err) => {
        console.error({ err });
        process.exit(1);
    });

    pool.connect()
        .then((client) => {
            console.log("DB connected.");
            client.release();
        }).catch(console.error);

    return pool;
}

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

export { dbStart, pool, dbClose };
