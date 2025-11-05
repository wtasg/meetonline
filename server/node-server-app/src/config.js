// @todo Use .env file to fill these values
const DEFAULT_SERVER_HTTP_PORT = 9006;
const DEFAULT_SERVER_HTTPS_PORT = 9443;

const SERVER_HTTP_PORT = Number(process.env.SERVER_HTTP_PORT ?? DEFAULT_SERVER_HTTP_PORT);
const SERVER_HTTPS_PORT = Number(process.env.SERVER_HTTPS_PORT ?? DEFAULT_SERVER_HTTPS_PORT);

if (!Number.isFinite(SERVER_HTTP_PORT)) {
    throw new Error("SERVER_HTTP_PORT must be a valid number");
}

if (!Number.isFinite(SERVER_HTTPS_PORT)) {
    throw new Error("SERVER_HTTPS_PORT must be a valid number");
}

const DB_PORT = 54321;
const DB_USER = "";
const DB_PASS = "";
const DB_NAME = "";
const DB_HOST = "localhost";

export {
    SERVER_HTTP_PORT,
    SERVER_HTTPS_PORT,
    DB_PORT,
    DB_USER,
    DB_PASS,
    DB_NAME,
    DB_HOST,
};
