import { useEffect } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { useSession } from "../hooks/useSession";
import { storeTokens } from "../utils/jwt";

function OAuthCallback() {
    const navigate = useNavigate();
    const { login } = useSession();

    useEffect(() => {
        // Extract tokens from URL fragment (#access_token=...&refresh_token=...)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const accessTokenExpiresAt = params.get("expires_at");
        const username = params.get("username");

        if (accessToken && refreshToken && username) {
            // Store tokens
            storeTokens({
                accessToken,
                refreshToken,
                accessTokenExpiresAt,
                refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // fallback 7 days
                username
            });

            // Update session state
            login();

            // Redirect to home
            navigate("/");
        } else {
            console.error("Missing tokens in OAuth callback");
            // Check for error in query params instead of hash
            const urlParams = new URLSearchParams(window.location.search);
            const error = urlParams.get("error");
            navigate(`/login${error ? `?error=${encodeURIComponent(error)}` : ""}`);
        }
    }, [login, navigate]);

    return (
        <div className="container flex hac vac p-5">
            <div className="text-center">
                <h2>Completing login...</h2>
                <p className="text-muted">Please wait while we set up your session.</p>
            </div>
        </div>
    );
}

export { OAuthCallback };
