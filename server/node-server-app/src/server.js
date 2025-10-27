import express from 'express';
import { SERVER_PORT } from './config.js';
import { setupCorsMiddleware } from './middlewares/corsMiddleware.js';
import { setupRootHandlers } from './handlers/rootHandler.js';

const app = express();

/* Middlewares */
setupCorsMiddleware(app);

/* Endpoint Handlers */
setupRootHandlers(app);

app.listen(SERVER_PORT, () => {
    console.log(`Example app listening on port ${SERVER_PORT}`);
});

// @todo setup graceful exit
