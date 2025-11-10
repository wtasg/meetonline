
import { authStore } from "./store.js";

async function userSession({ username }) {
    return {
        username,
        session: await authStore.retrieve(`session_for_${username}`)
    };
}

export { userSession };
