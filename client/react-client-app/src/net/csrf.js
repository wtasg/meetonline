import { CONF } from "./net-conf.js";

let csrfToken = null;

let fetchPromise = null;

async function fetchCsrfToken() {
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

function getCsrfToken() {
    return csrfToken;
}

function getCsrfHeaders() {
    return csrfToken ? { "x-csrf-token": csrfToken } : {};
}

/**
 * Ensures a CSRF token is available. If not, fetches it.
 */
async function ensureCsrfToken() {
    if (csrfToken) return;

    if (!fetchPromise) {
        fetchPromise = fetchCsrfToken();
    }
    await fetchPromise;
}

/**
 * Reset the CSRF token (for testing or logout)
 */
function resetCsrfToken() {
    csrfToken = null;
    fetchPromise = null;
}

export { fetchCsrfToken, getCsrfToken, getCsrfHeaders, ensureCsrfToken, resetCsrfToken };
