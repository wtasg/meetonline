import { existsSync, mkdirSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

import express from "express";
import morgan from "morgan";
import compression from "compression";
import * as cookieParserPkg from "cookie-parser";

import { SERVER_PORT } from "./config.js";
import { setupCorsMiddleware } from "./middlewares/corsMiddleware.js";
import { setupRootHandlers } from "./handlers/rootHandler.js";
import { setupAuthHandlers } from "./handlers/authHandler.js";
import { setupGracefulShutdown } from "./utils/gracefulSetup.js";
import { setupUploadHandler } from "./handlers/uploadHandler.js";
import { setupDirectories } from "./utils/fs.js";
import { loadEnv } from "./utils/env.js";

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

app.use("/uploads", express.static(pathResolve(process.cwd(), "server/node-server-app/uploads")));

/* Endpoint Handlers */
setupRootHandlers(app);
setupAuthHandlers(app);
setupUploadHandler(app);

const server = app.listen(SERVER_PORT, () => {
    console.log(`Example app listening on port ${SERVER_PORT}`);
});

setupGracefulShutdown(server);

export { app };
