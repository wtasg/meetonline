import { user_session } from "../session.js";
import { userAccount } from "../net/userAccount.js";

/**
 *
 * @returns {Promise<{username: string, createdAt: string, modifiedAt: string}>}
 */
async function fetchUserAccount() {
    const username = user_session.retrieve("username");
    const ua = await userAccount({ username });
    console.log({ ua });
    return ua;
}

export { fetchUserAccount };
