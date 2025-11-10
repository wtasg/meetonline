import { existsSync, mkdirSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { readFileSync } from "node:fs";

import express from "express";
import morgan from "morgan";
import compression from "compression";
import * as cookieParserPkg from "cookie-parser";

// middlewares
import { setupCorsMiddleware } from "./middlewares/corsMiddleware.js";

// endpoint handlers
import { setupRootHandlers } from "./handlers/rootHandler.js";
import { setupAuthHandlers } from "./handlers/authHandler.js";
import { setupGracefulShutdown } from "./utils/gracefulSetup.js";
import { setupUploadHandler } from "./handlers/uploadHandler.js";
import { setupUserAccountHandler } from "./handlers/userAccountHandler.js";

import { setupDirectories } from "./utils/fs.js";
import { loadEnv } from "./utils/env.js";
import { projectRoot } from "./utils/projectRoot.js";
import { dbStart } from "./database/db.js";

const app = express();
const cookieParser = cookieParserPkg.default;

/* process environment */
const isProduction = process.env.NODE_ENV === "production";
loadEnv(process.env.NODE_ENV);

/* setup database connection */
await dbStart();

setupDirectories({ exists: existsSync, mkdir: mkdirSync });

/* Middlewares */
setupCorsMiddleware(app);
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(morgan(isProduction ? "combined" : "dev"));
app.use("/uploads", express.static(pathResolve(projectRoot, "uploads")));

/* Endpoint Handlers */
setupRootHandlers(app);
setupAuthHandlers(app);
setupUploadHandler(app);
setupUserAccountHandler(app);

/* Setting up Servers */
const { SERVER_HTTP_PORT, SERVER_HTTPS_PORT } = process.env;

const httpServer = createHttpServer(app);
httpServer.listen(SERVER_HTTP_PORT, () => {
    console.log(`Server running at http://localhost:${SERVER_HTTP_PORT}`);
});
setupGracefulShutdown(httpServer);

try {
    const sslOptions = {
        key: readFileSync(pathResolve(projectRoot, "certs/server.key")),
        cert: readFileSync(pathResolve(projectRoot, "certs/server.crt")),
    };
    const httpsServer = createHttpsServer(sslOptions, app);
    httpsServer.listen(SERVER_HTTPS_PORT, () => {
        console.log(`Server running at https://localhost:${SERVER_HTTPS_PORT}`);
    });
    setupGracefulShutdown(httpsServer);
} catch (error) {
    console.warn(error.message);
    process.exit(1);
}

export { app };
