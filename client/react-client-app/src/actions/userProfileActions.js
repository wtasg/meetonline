import { user_session } from "../session.js";
import { userProfile, updateUserProfile } from "../net/userProfile.js";

/**
 *
 * @returns {Promise<{id: number, profileName: string, displayName: string, phoneNumber: string, email: string, address: string, websiteUrl: string, createdAt: string, modifiedAt: string}>}
 */
async function fetchUserProfile() {
    const username = user_session.retrieve("username");
    const ua = await userProfile({ username });
    return ua;
}

async function updateProfileName(value) {
    const key = "profileName";
    const username = user_session.retrieve("username");
    return await updateUserProfile({ username, key, value });
}
async function updateDisplayName(value) {
    const key = "displayName";
    const username = user_session.retrieve("username");
    return await updateUserProfile({ username, key, value });
}
async function updatePhoneNumber(value) {
    const key = "phoneNumber";
    const username = user_session.retrieve("username");
    return await updateUserProfile({ username, key, value });
}
async function updateEmail(value) {
    const key = "email";
    const username = user_session.retrieve("username");
    return await updateUserProfile({ username, key, value });
}
async function updateAddress(value) {
    const key = "address";
    const username = user_session.retrieve("username");
    return await updateUserProfile({ username, key, value });
}
async function updateWebsiteUrl(value) {
    const key = "websiteUrl";
    const username = user_session.retrieve("username");
    return await updateUserProfile({ username, key, value });
}

export {
    fetchUserProfile,
    updateProfileName,
    updateDisplayName,
    updatePhoneNumber,
    updateEmail,
    updateAddress,
    updateWebsiteUrl,
};
