let serverUrl;

if (import.meta.env.MODE === "production") {
    serverUrl = import.meta.env.VITE_SECURE_API_URL;
} else {
    serverUrl = import.meta.env.VITE_API_URL;
}

const CONF = {
    SERVER: serverUrl,
    URLS: {
        LOGIN: "login",
        SIGNUP: "signup",
        LOGOUT: "logout",
        USER_ACCOUNT: "user_account",
    }
};

export { CONF };
