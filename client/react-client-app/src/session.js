import { Storage } from "./utils/storage.js";

const user_session = new Storage(["session", "local"]);

const location = new Storage(["local"]);

const existingLocation = location?.retrieve("path") ?? "/";
location.store("path", existingLocation);

export { user_session, location };
