import express from 'express';
import * as cookieParserPkg from 'cookie-parser';

import { SERVER_PORT } from './config.js';
import { setupCorsMiddleware } from './middlewares/corsMiddleware.js';
import { setupRootHandlers } from './handlers/rootHandler.js';
import { setupAuthHandlers } from './handlers/authHandler.js';
import { setupGracefulShutdown } from './utils/gracefulSetup.js';

const app = express();
const cookieParser = cookieParserPkg.default;

/* Middlewares */
app.use(express.json());
app.use(cookieParser());
setupCorsMiddleware(app);

/* Endpoint Handlers */
setupRootHandlers(app);
setupAuthHandlers(app);

const server = app.listen(SERVER_PORT, () => {
    console.log(`Example app listening on port ${SERVER_PORT}`);
});

setupGracefulShutdown(server);

export { app };
