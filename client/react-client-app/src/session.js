import { Storage } from "./utils/storage.js";

const user_session = new Storage(["session"]);

const location = new Storage(["local"]);

const existingLocation = location?.retrieve("path") ?? "/";
location.store("path", existingLocation);

const resetLocation = () => {
    location.eject("path");
    location.store("path", "/");
};

const resetUserSession = () => {
    user_session.eject("username");
    user_session.eject("session");
};

export { user_session, location, resetLocation, resetUserSession };
