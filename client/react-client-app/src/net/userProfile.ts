import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";

interface UserProfile {
    id: string;
    profileName: string;
    displayName: string;
    phoneNumber: string;
    email: string;
    address: string;
    websiteUrl: string;
    createdAt: string;
    modifiedAt: string;
}

interface UserProfileResponse {
    ok: boolean;
    message?: string;
    user_profile?: UserProfile | false;
}

/**
 * Fetches the profile data for the current authenticated user.
 * @returns {Promise<UserProfileResponse>} A promise resolving to a UserProfileResponse containing the profile data or error.
 */
async function fetchUserProfile(): Promise<UserProfileResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.USER_PROFILE}`, {
            credentials: "include",
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        });
        return response.json();

    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message, user_profile: false };
    }
}

/**
 * Updates a single field in the user's profile.
 * @param {Object} options - The update options.
 * @param {string} options.key - The profile field to update (e.g., 'displayName', 'email').
 * @param {string} options.value - The new value for the field.
 * @returns {Promise<UserProfileResponse>} A promise resolving to a UserProfileResponse indicating success or failure.
 */
async function updateUserProfile({ key, value }: { key: string; value: string }): Promise<UserProfileResponse> {
    try {
        const response = await authenticatedFetch(`${CONF.HTTPS_SERVER}/${CONF.URLS.USER_PROFILE}`, {
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
    catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
}

export {
    fetchUserProfile,
    updateUserProfile
};
