import { fetchUserProfile as netFetchUserProfile, updateUserProfile as netUpdateUserProfile } from "../net/userProfile.js";

async function fetchUserProfile() {
    return netFetchUserProfile({});
}
async function updateProfileName(value) {
    return netUpdateUserProfile({ key: "profileName", value });
}
async function updateDisplayName(value) {
    return netUpdateUserProfile({ key: "displayName", value });
}
async function updatePhoneNumber(value) {
    return netUpdateUserProfile({ key: "phoneNumber", value });
}
async function updateEmail(value) {
    return netUpdateUserProfile({ key: "email", value });
}
async function updateAddress(value) {
    return netUpdateUserProfile({ key: "address", value });
}
async function updateWebsiteUrl(value) {
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
