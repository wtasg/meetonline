import cors from "cors";

function setupCorsMiddleware(app) {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS?.split(",")
        .map(s => s.trim().toLowerCase().replace(/\/$/, "")
        ) ||
        [
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
        ]
    )
        .filter(url => url.trim().length > 0)
        .map(url => url.toLowerCase().replace(/\/$/, ""));

    const corsOptions = {
        origin: (originUrl, callback) => {
            // allow mobile / curl / SSR: clients that don't generally send origin header
            if (!originUrl) return callback(null, true);
            const cleanOrigin = originUrl.toLowerCase().replace(/\/$/, "");
            if (allowedOrigins.includes(cleanOrigin)) {
                callback(null, true);
            } else {
                console.error(`CORS blocked: ${cleanOrigin}`);
                callback(new Error(`Origin ${cleanOrigin} not allowed by CORS`));
            }

        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    };

    app.use(cors(corsOptions));
}

export { setupCorsMiddleware };
