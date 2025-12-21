import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { OIDCStrategy as MicrosoftStrategy } from "passport-azure-ad";
import AppleStrategy from "passport-apple";
import FacebookStrategy from "passport-facebook";
import { createOAuthConnection, getOAuthConnectionByProvider } from "../database/oauth_connections.js";

function setupPassport() {
    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || "placeholder",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
        callbackURL: `${process.env.BACKEND_URL || "https://meet.online:9443"}/api/oauth/google/callback`,
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {
        return handleOAuthCallback(req, "google", profile, done);
    }));

    // Microsoft Strategy (Azure AD)
    passport.use(new MicrosoftStrategy({
        identityMetadata: "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
        clientID: process.env.MICROSOFT_CLIENT_ID || "placeholder",
        responseType: "code id_token",
        responseMode: "form_post",
        redirectUrl: `${process.env.BACKEND_URL || "https://meet.online:9443"}/api/oauth/microsoft/callback`,
        allowHttpForRedirectUrl: true,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "placeholder",
        validateIssuer: false,
        passReqToCallback: true,
    }, async (req, iss, sub, profile, accessToken, refreshToken, done) => {
        return handleOAuthCallback(req, "microsoft", profile, done);
    }));

    // Facebook Strategy
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID || "placeholder",
        clientSecret: process.env.FACEBOOK_APP_SECRET || "placeholder",
        callbackURL: `${process.env.BACKEND_URL || "https://meet.online:9443"}/api/oauth/facebook/callback`,
        profileFields: ["id", "emails", "name"],
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {
        return handleOAuthCallback(req, "facebook", profile, done);
    }));

    // Apple Strategy
    passport.use(new AppleStrategy({
        clientID: process.env.APPLE_CLIENT_ID || "placeholder",
        teamID: process.env.APPLE_TEAM_ID || "placeholder",
        keyID: process.env.APPLE_KEY_ID || "placeholder",
        privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH || "placeholder",
        callbackURL: `${process.env.BACKEND_URL || "https://meet.online:9443"}/api/oauth/apple/callback`,
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, idToken, profile, done) => {
        return handleOAuthCallback(req, "apple", profile, done);
    }));
}

async function handleOAuthCallback(req, provider, profile, done) {
    try {
        const providerId = profile.id;
        const email = profile.emails?.[0]?.value || profile.email;

        // check if already connected
        const existingConn = await getOAuthConnectionByProvider(provider, providerId);

        if (req.user && req.user.userId) {
            // CONNECT MODE (User is already logged in)
            const userId = parseInt(req.user.userId);

            if (!existingConn.__isNull && existingConn.userId !== userId) {
                return done(new Error("This social account is already connected to another user."));
            }

            const connection = await createOAuthConnection(userId, provider, providerId, email, profile);
            return done(null, { ...connection, mode: "connect" });
        } else {
            // LOGIN MODE (User is NOT logged in)
            if (existingConn.__isNull) {
                // Not connected yet - return error as per requirement
                return done(null, false, { message: "Social account not connected. Please login with username/password first." });
            }

            // Find the user associated with this connection
            // We need to return the user info so the handler can issue tokens
            return done(null, { userId: existingConn.userId, mode: "login" });
        }
    } catch (error) {
        console.error(`Error in ${provider} callback:`, error);
        return done(error);
    }
}

export { setupPassport };
