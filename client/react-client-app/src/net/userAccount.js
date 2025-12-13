import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";

/**
 *
 * @param {{username: string}} options
 * @returns {Promise<{username: string, createdAt: string, modifiedAt: string}>}
 */
async function userAccount({ username }) {
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
    } catch (err) {
        console.error(err);
        return { ok: false };
    }
}

export {
    userAccount
};
