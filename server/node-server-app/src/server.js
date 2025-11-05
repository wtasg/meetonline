import { existsSync, mkdirSync } from "node:fs";
import { resolve as pathResolve, join } from "node:path";
import { createServer as httpServer } from "node:http";
import { createServer as httpsServer } from "node:https";
import { readFileSync } from "node:fs";

import express from "express";
import morgan from "morgan";
import compression from "compression";
import * as cookieParserPkg from "cookie-parser";

import { SERVER_HTTP_PORT, SERVER_HTTPS_PORT } from "./config.js";
import { setupCorsMiddleware } from "./middlewares/corsMiddleware.js";
import { setupRootHandlers } from "./handlers/rootHandler.js";
import { setupAuthHandlers } from "./handlers/authHandler.js";
import { setupGracefulShutdown } from "./utils/gracefulSetup.js";
import { setupUploadHandler } from "./handlers/uploadHandler.js";
import { setupDirectories } from "./utils/fs.js";
import { loadEnv } from "./utils/env.js";
import { projectRoot } from "./utils/projectRoot.js";

const app = express();
const cookieParser = cookieParserPkg.default;

loadEnv(process.env.NODE_ENV);

const isProduction = process.env.NODE_ENV === "production";

setupDirectories({ exists: existsSync, mkdir: mkdirSync });
/* Middlewares */
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(
    morgan(isProduction ? "combined" : "dev")
);

setupCorsMiddleware(app);

app.use("/uploads", express.static(pathResolve(projectRoot, "uploads")));

/* Endpoint Handlers */
setupRootHandlers(app);
setupAuthHandlers(app);
setupUploadHandler(app);

//start http server first
const httpServerInstance = httpServer(app);
httpServerInstance.listen(SERVER_HTTP_PORT, () => {
    console.log(`HTTP running at http://localhost:${SERVER_HTTP_PORT}`);
});
setupGracefulShutdown(httpServerInstance);

//try enabling https
try {
    const sslOptions = {
        key: readFileSync(join(projectRoot, "certs/server.key")),
        cert: readFileSync(join(projectRoot, "certs/server.crt")),
    };

    const httpsServerInstance = httpsServer(sslOptions, app);
    httpsServerInstance.listen(SERVER_HTTPS_PORT, () => {
        console.log(`HTTPS running at https://localhost:${SERVER_HTTPS_PORT}`);
    });
    setupGracefulShutdown(httpsServerInstance);

} catch (error) {
    console.warn("HTTPS disabled: certificate files not found.");
    console.warn(error.message);
    console.warn("Run `npm run build:certs` to generate self-signed certificates.\n");

    if (isProduction) {
        console.error("HTTPS required in production. Stopping server.");
        process.exit(1);
    } else {
        console.log("Development mode: HTTP only.");
    }
}

export { app };
