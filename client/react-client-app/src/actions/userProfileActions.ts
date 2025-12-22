import { fetchUserProfile as netFetchUserProfile, updateUserProfile as netUpdateUserProfile } from "../net/userProfile.js";

interface UserProfileActionResponse {
    ok: boolean;
    message?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

/**
 * Fetches the profile data for the current authenticated user.
 * @returns {Promise<UserProfileActionResponse>} A promise that resolves to a UserProfileActionResponse containing the profile data or error message.
 */
async function fetchUserProfile(): Promise<UserProfileActionResponse> {
    return netFetchUserProfile();
}

/**
 * Updates the profile name for the current authenticated user.
 * @param {string} value - The new profile name value.
 * @returns {Promise<UserProfileActionResponse>} A promise that resolves to a UserProfileActionResponse indicating success or failure.
 */
async function updateProfileName(value: string): Promise<UserProfileActionResponse> {
    return netUpdateUserProfile({ key: "profileName", value });
}

/**
 * Updates the display name for the current authenticated user.
 * @param {string} value - The new display name value.
 * @returns {Promise<UserProfileActionResponse>} A promise that resolves to a UserProfileActionResponse indicating success or failure.
 */
async function updateDisplayName(value: string): Promise<UserProfileActionResponse> {
    return netUpdateUserProfile({ key: "displayName", value });
}

/**
 * Updates the phone number for the current authenticated user.
 * @param {string} value - The new phone number value.
 * @returns {Promise<UserProfileActionResponse>} A promise that resolves to a UserProfileActionResponse indicating success or failure.
 */
async function updatePhoneNumber(value: string): Promise<UserProfileActionResponse> {
    return netUpdateUserProfile({ key: "phoneNumber", value });
}

/**
 * Updates the email address for the current authenticated user.
 * @param {string} value - The new email address value.
 * @returns {Promise<UserProfileActionResponse>} A promise that resolves to a UserProfileActionResponse indicating success or failure.
 */
async function updateEmail(value: string): Promise<UserProfileActionResponse> {
    return netUpdateUserProfile({ key: "email", value });
}

/**
 * Updates the address for the current authenticated user.
 * @param {string} value - The new address value.
 * @returns {Promise<UserProfileActionResponse>} A promise that resolves to a UserProfileActionResponse indicating success or failure.
 */
async function updateAddress(value: string): Promise<UserProfileActionResponse> {
    return netUpdateUserProfile({ key: "address", value });
}

/**
 * Updates the website URL for the current authenticated user.
 * @param {string} value - The new website URL value.
 * @returns {Promise<UserProfileActionResponse>} A promise that resolves to a UserProfileActionResponse indicating success or failure.
 */
async function updateWebsiteUrl(value: string): Promise<UserProfileActionResponse> {
    return netUpdateUserProfile({ key: "websiteUrl", value });
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
