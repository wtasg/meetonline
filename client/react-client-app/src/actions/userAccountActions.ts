import { user_session } from "../session.js";
import { userAccount } from "../net/userAccount.js";

interface UserAccountActionResponse {
    ok?: boolean;
    username?: string;
    createdAt?: string;
    modifiedAt?: string;
}

/**
 * Fetches the account details for the current authenticated user.
 * Retrieves the username from session storage and fetches corresponding account data.
 * @returns {Promise<UserAccountActionResponse>} A promise that resolves to a UserAccountActionResponse containing account details
 *          (username, createdAt, modifiedAt) or { ok: false } if not authenticated.
 */
async function fetchUserAccount(): Promise<UserAccountActionResponse> {
    const username = user_session.retrieve("username");
    if (!username) {
        return { ok: false };
    }
    const ua = await userAccount({ username });
    return ua;
}

export { fetchUserAccount };
