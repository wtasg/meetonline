import { CONF } from "./net-conf.js";

/**
 * Fetches User Profile
 * @param {{username: string}} options
 * @returns {Promise<{profileName: string, displayName: string, phoneNumber: string, email: string, address: string, websiteUrl: string, createdAt: string, modifiedAt: string}>}
 */
async function userProfile({ username }) {
    try {
        const response = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.USER_PROFILE}`, {
            credentials: "include",
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
        });
        const json = await response.json();
        if (!json.ok) {
            console.error(json);
        }
        return json;
    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message };
    }
}


async function updateUserProfile({ username, key, value }) {
    try {
        const response = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.USER_PROFILE}`, {
            credentials: "include",
            method: "PATCH",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, key, value }),
        });
        const json = await response.json();
        if (!json.ok) {
            console.error(json);
        }
        return json;
    }
    catch (err) {
        console.error(err);
        return { ok: false, message: err.message };
    }
}

export {
    userProfile,
    updateUserProfile
};
