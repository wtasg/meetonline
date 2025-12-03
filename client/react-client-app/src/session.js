import { Storage } from "./utils/storage.js";

const user_session = new Storage(["session", "local"]);

const location = new Storage(["memory"]);

location.store("path", "/");

export { user_session, location };
