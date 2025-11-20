import { user_session } from "../session.js";
import { userProfile } from "../net/userProfile.js";

/**
 *
 * @returns {Promise<{username: string, createdAt: string, modifiedAt: string}>}
 */
async function fetchUserProfile() {
    const username = user_session.retrieve("username");
    const ua = await userProfile({ username });
    return ua;
}

export { fetchUserProfile };
