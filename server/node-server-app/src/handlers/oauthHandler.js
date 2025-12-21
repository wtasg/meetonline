import passport from "passport";
import { issueTokenPair } from "../utils/authUtils.js";
import { hybridAuthMiddleware } from "../middlewares/hybridAuthMiddleware.js";

/**
 * @param {Express.Application} app
 */
function setupOAuthHandlers(app) {
    // Initiation routes
    app.get("/oauth/google", (req, res, next) => {
        const isConnect = req.query.mode === "connect";
        const middleware = isConnect ? hybridAuthMiddleware : (r, rs, n) => n();
        middleware(req, res, () => {
            passport.authenticate("google", {
                scope: ["profile", "email"],
                state: JSON.stringify({ mode: isConnect ? "connect" : "login" })
            })(req, res, next);
        });
    });

    app.get("/oauth/microsoft", (req, res, next) => {
        const isConnect = req.query.mode === "connect";
        const middleware = isConnect ? hybridAuthMiddleware : (r, rs, n) => n();
        middleware(req, res, () => {
            passport.authenticate("azuread-openidconnect", {
                state: JSON.stringify({ mode: isConnect ? "connect" : "login" })
            })(req, res, next);
        });
    });

    app.get("/oauth/facebook", (req, res, next) => {
        const isConnect = req.query.mode === "connect";
        const middleware = isConnect ? hybridAuthMiddleware : (r, rs, n) => n();
        middleware(req, res, () => {
            passport.authenticate("facebook", {
                scope: ["email"],
                state: JSON.stringify({ mode: isConnect ? "connect" : "login" })
            })(req, res, next);
        });
    });

    app.get("/oauth/apple", (req, res, next) => {
        const isConnect = req.query.mode === "connect";
        const middleware = isConnect ? hybridAuthMiddleware : (r, rs, n) => n();
        middleware(req, res, () => {
            passport.authenticate("apple", {
                state: JSON.stringify({ mode: isConnect ? "connect" : "login" })
            })(req, res, next);
        });
    });

    // Callback routes
    const providers = ["google", "microsoft", "facebook", "apple"];
    providers.forEach(provider => {
        app.get(`/oauth/${provider}/callback`, (req, res, next) => {
            const authOptions = { session: false, failWithError: true };

            passport.authenticate(provider, authOptions, async (err, result, info) => {
                const frontendUrl = process.env.FRONTEND_URL || "https://meet.online";

                if (err) {
                    console.error(`${provider} auth error:`, err);
                    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(err.message)}`);
                }

                if (!result) {
                    const msg = info?.message || "Authentication failed";
                    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(msg)}`);
                }

                if (result.mode === "connect") {
                    // Success connect
                    return res.redirect(`${frontendUrl}/settings?connected=${provider}`);
                } else if (result.mode === "login") {
                    // Success login - issue tokens
                    try {
                        const { userId } = result;
                        // For login flow, we need to issue JWT tokens. 
                        // But we are in a redirect flow. We'll pass tokens in URL (fragment is safer)
                        // Or a one-time code. For simplicity here, we'll use fragment.
                        const tokens = await issueTokenPair({ id: userId, username: "social_user" }); // username fallback

                        const params = new URLSearchParams({
                            access_token: tokens.accessToken,
                            refresh_token: tokens.refreshToken,
                            expires_at: tokens.accessTokenExpiresAt,
                            username: tokens.username
                        });

                        return res.redirect(`${frontendUrl}/oauth/callback#${params.toString()}`);
                    } catch (error) {
                        console.error("Token issue error:", error);
                        return res.redirect(`${frontendUrl}/login?error=Token issuance failed`);
                    }
                }
            })(req, res, next);
        });
    });
}

export { setupOAuthHandlers };
