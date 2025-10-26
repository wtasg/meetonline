import express from 'express';
import cors from 'cors';

const app = express();

// Environment-specific origins
const allowedOrigins = [
    'http://localhost:5173',
    'https://localhost:5173'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

const SERVER_PORT = 9006;

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/cel', (req, res) => {
    res.send('Engine Check Light is OFF!');
});
app.listen(SERVER_PORT, () => {
    console.log(`Example app listening on port ${SERVER_PORT}`);
});
