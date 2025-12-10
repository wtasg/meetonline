import { CONF } from "./net-conf.js";

/**
 * Fetches User Profile
 * @returns {Promise<{ok: boolean, message: string, user_profile: {id: string, profileName: string, displayName: string, phoneNumber: string, email: string, address: string, websiteUrl: string, createdAt: string, modifiedAt: string}}>}
 */
async function fetchUserProfile() {
    try {
        const response = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.USER_PROFILE}`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();

    } catch (err) {
        console.error(err);
        return { ok: false, message: err.message, user_profile: false };
    }
}

/**
 *
 * @param {{key: string, value: string}} options
 * @returns {Promise<{ok: boolean, message: string, user_profile: {id: string, profileName: string, displayName: string, phoneNumber: string, email: string, address: string, websiteUrl: string, createdAt: string, modifiedAt: string}}>}
 */
async function updateUserProfile({ key, value }) {
    try {
        const response = await fetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.USER_PROFILE}`, {
            credentials: "include",
            method: "PATCH",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ key, value }),
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
    fetchUserProfile,
    updateUserProfile
};
