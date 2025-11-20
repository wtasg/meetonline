import { CONF } from "./net-conf.js";

/**
 * Fetches User Profile
 * @param {{username: string}} options
 * @returns {Promise<{profileName: string, displayName: string, phoneNumber: string, email: string, address: string, websiteUrl: string, createdAt: string, modifiedAt: string}>}
 */
async function userProfile({ username }) {
    try {
        return await (await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.USER_ACCOUNT}`, {
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
    userProfile
};
