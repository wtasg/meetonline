import { Storage } from "./utils/storage.js";

const user_session = new Storage(["session", "local"]);

export { user_session };
