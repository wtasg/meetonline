import { CONF } from "./net-conf.js";

let csrfToken: string | null = null;

let fetchPromise: Promise<string | null> | null = null;

/**
 * Fetches a CSRF token from the server.
 * The token is cached for subsequent requests.
 * @returns {Promise<(string|null)>} A promise resolving to the CSRF token string, or null if the fetch fails.
 * @throws {Error} If the server request fails.
 */
async function fetchCsrfToken(): Promise<string | null> {
    try {
        const res = await fetch(`${CONF.HTTPS_SERVER}/csrf-token`, {
            credentials: "include",
            headers: {
                "Accept": "application/json",
            },
        });
        if (res.ok) {
            const data = await res.json();
            if (!data.token) {
                console.error("CSRF token missing from server response");
                return null;
            }
            csrfToken = data.token;
            return csrfToken;
        } else {
            const error = new Error(`Failed to fetch CSRF token: ${res.status} ${res.statusText}`);
            console.error(error.message);
            throw error;
        }
    } catch (e) {
        console.error("Failed to fetch CSRF token", e);
        throw e;
    } finally {
        fetchPromise = null;
    }
}

/**
 * Gets the currently cached CSRF token.
 * @returns {(string|null)} The cached CSRF token, or null if no token has been fetched.
 */
function getCsrfToken(): string | null {
    return csrfToken;
}

/**
 * Gets the CSRF headers object for use in HTTP requests.
 * @returns {Record<string, string>} An object containing the x-csrf-token header if a token exists, empty object otherwise.
 */
function getCsrfHeaders(): Record<string, string> {
    return csrfToken ? { "x-csrf-token": csrfToken } : {};
}

/**
 * Ensures a CSRF token is available before making a request.
 * If no token is cached, fetches one from the server.
 * Prevents duplicate requests if a fetch is already in progress.
 * @returns {Promise<void>} A promise that resolves when a valid token is available.
 */
async function ensureCsrfToken(): Promise<void> {
    if (csrfToken) return;

    if (!fetchPromise) {
        fetchPromise = fetchCsrfToken();
    }
    await fetchPromise;
}

/**
 * Resets the cached CSRF token.
 * Useful for testing or after logout to ensure a fresh token is fetched.
 * @returns {void}
 */
function resetCsrfToken(): void {
    csrfToken = null;
    fetchPromise = null;
}

export { fetchCsrfToken, getCsrfToken, getCsrfHeaders, ensureCsrfToken, resetCsrfToken };
