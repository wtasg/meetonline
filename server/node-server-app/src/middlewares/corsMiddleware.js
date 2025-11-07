import cors from "cors";

function setupCorsMiddleware(app) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(s => s.trim().toLocaleLowerCase()) || [
        "http://localhost:5173"
    ];

    const corsOptions = {
        origin: (origin, callback) => {
            // allow mobile / curl / SSR: clients that don't generally send origin header
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin.toLocaleLowerCase())) {
                callback(null, true);
            } else {
                callback(new Error(`Origin ${origin} not allowed by CORS`));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    };

    app.use(cors(corsOptions));
}

export { setupCorsMiddleware };
