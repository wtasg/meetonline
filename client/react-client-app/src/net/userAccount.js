import { CONF } from "./net-conf.js";
import { debounce }from "../utils/debounce.js";

/**
 *
 * @param {{username: string}} options
 * @returns {Promise<{username: string, createdAt: string, modifiedAt: string}>}
 */
const _userAccount = async function ({ username }) {
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
};

const userAccountDebouncer = debounce(_userAccount, 400);

function userAccount(options) {
    return userAccountDebouncer(options);
}

export {
    userAccount
};
