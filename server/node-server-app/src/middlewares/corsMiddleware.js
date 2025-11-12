import cors from "cors";

function setupCorsMiddleware(app) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(s => s.trim().toLowerCase().replace(/\/$/, "")) || [
        "http://localhost:5173",
        "https://localhost:5173",
        "http://localhost:5174",
        "https://localhost:5174",
        "http://localhost:5175",
        "https://localhost:5175",
        "http://localhost:5176",
        "https://localhost:5176",
        "http://localhost:5177",
        "https://localhost:5177",
        "http://localhost",
        "https://localhost",
    ];

    const corsOptions = {
        origin: (origin, callback) => {
            // allow mobile / curl / SSR: clients that don't generally send origin header
            if (!origin) return callback(null, true);
            const cleanOrigin = origin.toLowerCase().replace(/\/$/, "");
            if (allowedOrigins.includes(cleanOrigin)) {
                callback(null, true);
            } else {
                console.error(`CORS blocked: ${origin}`);
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
