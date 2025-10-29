import express from 'express';
import { SERVER_PORT } from './config.js';
import { setupCorsMiddleware } from './middlewares/corsMiddleware.js';
import { setupRootHandlers } from './handlers/rootHandler.js';
import { setupAuthHandlers } from './handlers/authHandler.js';
import { setupGracefulShutdown } from './utils/gracefulSetup.js';
import { closeDb } from './database/db.js';


const app = express();
app.use(express.json());

/* Middlewares */
setupCorsMiddleware(app);

/* Endpoint Handlers */
setupRootHandlers(app);
setupAuthHandlers(app);

const server = app.listen(SERVER_PORT, () => {
    console.log(`Example app listening on port ${SERVER_PORT}`);
});

setupGracefulShutdown(server, closeDb);

export default app;
