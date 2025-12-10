
const CONF = {
    HTTP_SERVER: "http://localhost:9006",
    HTTPS_SERVER: import.meta.env.VITE_API_URL,
    URLS: {
        LOGIN: "login",
        SIGNUP: "signup",
        LOGOUT: "logout",
        USER_ACCOUNT: "user_account",
        USER_PROFILE: "user_profile",
    }
};

export { CONF };
