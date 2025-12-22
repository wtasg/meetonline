import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";

interface UserAccountResponse {
    ok?: boolean;
    username?: string;
    createdAt?: string;
    modifiedAt?: string;
}

/**
 * Fetches account information for a specific user.
 * @param {Object} options - The request options.
 * @param {string} options.username - The username of the account to fetch.
 * @returns {Promise<UserAccountResponse>} A promise resolving to a UserAccountResponse containing account details or error.
 */
async function userAccount({ username }: { username: string }): Promise<UserAccountResponse> {
    try {
        return await (await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.USER_ACCOUNT}`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
        })).json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false };
    }
}

export {
    userAccount
};
