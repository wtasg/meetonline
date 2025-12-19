import { existsSync, mkdirSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { readFileSync } from "node:fs";

import express from "express";
import morgan from "morgan";
import compression from "compression";
import * as cookieParserPkg from "cookie-parser";
import helmet from "helmet";

// middlewares
import { setupCorsMiddleware } from "./middlewares/corsMiddleware.js";
import { doubleCsrfProtection, generateCsrfToken } from "./middlewares/csrfMiddleware.js";

// endpoint handlers
import { setupRootHandlers } from "./handlers/rootHandler.js";
import { setupAuthHandlers } from "./handlers/authHandler.js";
import { setupGracefulShutdown, setBatchDeletionProcessor } from "./utils/gracefulSetup.js";
import { setupUploadHandler } from "./handlers/uploadHandler.js";
import { setupUserAccountHandler } from "./handlers/userAccountHandler.js";

import { setupDirectories } from "./utils/fs.js";
import { loadEnv } from "./utils/env.js";
import { projectRoot } from "./utils/projectRoot.js";
import { dbStart } from "./database/db.js";
import { setupUserProfileHandler } from "./handlers/userProfileHandler.js";
import { setupGroupHandler } from "./handlers/groupHandler.js";
import { setupUserSettingsHandler } from "./handlers/userSettingsHandler.js";
import { setupEventHandler } from "./handlers/eventHandler.js";
import { setupSearchHandler } from "./handlers/searchHandler.js";
import { setupNotificationHandler } from "./handlers/notificationHandler.js";
import { startBatchDeletionProcessor } from "./utils/batchDeletion.js";

const app = express();
const cookieParser = cookieParserPkg.default;

/* process environment */
const isProduction = process.env.NODE_ENV === "production";
loadEnv(process.env.NODE_ENV);

/* setup database connection */
await dbStart();

setupDirectories({ exists: existsSync, mkdir: mkdirSync });

/* Middlewares */
app.use(helmet());
app.use(helmet.noSniff());
app.disable("x-powered-by");
setupCorsMiddleware(app);
app.use(compression());
app.use(express.json());
app.use(cookieParser());

// CSRF Protection - applied selectively
// Skip CSRF for auth endpoints that users access before having a token
const csrfExemptRoutes = ["/auth_token", "/auth_refresh", "/signup", "/csrf-token"];

// Endpoint to get a CSRF token
app.get("/csrf-token", (req, res) => {
    const token = generateCsrfToken(req, res);
    res.json({ token });
});

app.use((req, res, next) => {
    if (csrfExemptRoutes.includes(req.path)) {
        return next();
    }
    doubleCsrfProtection(req, res, next);
});
// Error handler for CSRF to return JSON instead of HTML if preferred, 
// strictly speaking double-csrf throws an error we might want to catch or let the default handler handle it.
// server.js doesn't seem to have a specific error handler for this yet, assuming default express behaviour or we add one.
// Let's add a simple one for CSRF errors if we want custom JSON response
app.use((err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
        return res.status(403).json({
            ok: false,
            message: "Invalid CSRF token"
        });
    }
    next(err);
});

app.use(morgan(isProduction ? "combined" : "dev"));

/* Handlers */
app.use("/uploads", express.static(pathResolve(projectRoot, "uploads")));
setupRootHandlers(app);
setupAuthHandlers(app);
setupUploadHandler(app);
setupUserAccountHandler(app);
setupUserProfileHandler(app);
setupGroupHandler(app);
setupUserSettingsHandler(app);
setupEventHandler(app);
setupSearchHandler(app);
setupNotificationHandler(app);

// Start batch deletion processor (runs daily)
// In production, you might want to use a dedicated cron job instead
// The interval is set to 24 hours (86400000 ms)
const batchDeletionProcessor = startBatchDeletionProcessor(24 * 60 * 60 * 1000);
setBatchDeletionProcessor(batchDeletionProcessor);

// Reject All Unsupported Routes
app.use((req, res) => {
    console.log(Date.now(), req.path);
    res.status(404).end();
});

/* Setting up Servers */
const { SERVER_HTTP_PORT, SERVER_HTTPS_PORT } = process.env;

const httpServer = createHttpServer(app);
httpServer.listen(SERVER_HTTP_PORT, (err) => {
    if (err) {
        console.error(`Failed to start HTTP server on port ${SERVER_HTTP_PORT}:`, err);
        process.exit(1);
    }
    console.log(`HTTP server listening on port ${SERVER_HTTP_PORT}`);
});
setupGracefulShutdown(httpServer);

try {
    const sslOptions = {
        key: readFileSync(pathResolve(projectRoot, "certs/server.key")),
        cert: readFileSync(pathResolve(projectRoot, "certs/server.crt")),
    };
    const httpsServer = createHttpsServer(sslOptions, app);
    httpsServer.listen(SERVER_HTTPS_PORT, (err) => {
        if (err) {
            console.error(`Failed to start HTTPS server on port ${SERVER_HTTPS_PORT}:`, err);
            process.exit(1);
        }
        console.log(`HTTPS server listening on port ${SERVER_HTTPS_PORT}`);
    });
    setupGracefulShutdown(httpsServer);
} catch (error) {
    console.warn(error.message);
    process.exit(1);
}

export { app };
