import express from 'express';
import cors from 'cors';
import { SERVER_PORT } from './config/serverConfig.js';
import { corsOptions } from './config/corsConfig.js';
import routes from './routes/index.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.use('/', routes);

app.listen(SERVER_PORT, () => {
    console.log(`Server running on port ${SERVER_PORT}`);
});

export { app };
