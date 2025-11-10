import { resolve as pathResolve } from "node:path";
import { existsSync as exists, readFileSync as read, writeFileSync as write } from "node:fs";
import { createOrUpdateKVPair, deleteKVPair, getKVPair } from "../database/kv_store.js";
import { TMP_DIR } from "./fs.js";

class KVStore {
    /**
     * @constructor
     * @param {("memory"|"file"|"db")[]} types
     */
    constructor(types) {
        this.stores = types.map((t) => {
            switch (t) {
                case "memory":
                    return new MemoryStore();
                case "file":
                    return new TmpFileStore();
                case "db":
                    return new DBStore();
                default:
                    return new MemoryStore();
            }
        });
    }
    /**
     * Saves a kv entry
     * @param {string} key The key for the value to be stored
     * @param {string|number} value The value
     * @returns {Promise<void>}
     */
    async store(key, value) {
        await Promise.all(this.stores.map((s) => s.store(key, value)));
    }

    /**
     * Fetches the value for a given key.
     * @param {string} key The key for which the value will be retrieved
     * @returns {Promise<string|number>}
     */
    async retrieve(key) {
        if (!key || typeof key !== "string") {
            throw new TypeError("Param key should be of type string.");
        }
        if (this.stores.length < 1) {
            throw new Error("ERROR: no store available!");
        }
        for (const store of this.stores) {
            const value = await store.retrieve(key);
            if (value !== undefined && value !== null) {
                return value;
            }
        }
        return null;
    }

    /**
     * Removes the kv entry.
     * @param {string} key The key for which kv entry will be removed
     */
    async eject(key) {
        await Promise.all(this.stores.map((s) => s.eject(key)));
    }
}

class MemoryStore {
    constructor() {
        this.storage = {};
    }
    /**
     *
     * @param {string} key
     * @param {string|number} value
     */
    async store(key, value) {
        this.storage[String(key)] = value;
    }

    /**
     *
     * @param {string} key
     * @returns {Promise<string|number>}
     */
    async retrieve(key) {
        const storageKey = String(key);
        return Object.prototype.hasOwnProperty.call(this.storage, storageKey)
            ? this.storage[storageKey]
            : null;
    }

    /**
     *
     * @param {string} key
     */
    async eject(key) {
        delete this.storage[String(key)];
    }
}

class TmpFileStore {
    constructor() {
        this.filename = pathResolve(TMP_DIR, "tmp_file_store.txt.tmp");
        if (!exists(this.filename)) {
            write(this.filename, "", "utf-8");
        }
    }

    /**
     * Stores a key-value pair in the file.
     * @param {string} key The key for the value to be stored
     * @param {string|number} value The value
     */
    async store(key, value) {
        if (!key || typeof key !== "string") {
            throw new TypeError("Param key should be of type string.");
        }
        const lines = this._readLines();
        const newLines = [];
        let updated = false;

        // Update existing key or add new key
        for (const line of await lines) {
            const [k,] = line.split("=", 2);
            if (k === key) {
                newLines.push(`${key}=${value}`);
                updated = true;
            } else {
                newLines.push(line);
            }
        }

        if (!updated) {
            newLines.push(`${key}=${value}`);
        }

        // Write all lines back to the file
        write(this.filename, newLines.join("\n"), "utf-8");
    }

    /**
     * Retrieves the value for a given key from the file.
     * @param {string} key The key for which the value will be retrieved
     * @returns {Promise<string|number|null>}
     */
    async retrieve(key) {
        if (!key || typeof key !== "string") {
            throw new TypeError("Param key should be of type string.");
        }
        const lines = this._readLines();
        for (const line of await lines) {
            const [k, v] = line.split("=", 2);
            if (k === key) {
                return v;
            }
        }
        return null;
    }

    /**
     * Removes a key-value pair from the file.
     * @param {string} key The key for which the entry will be removed
     */
    async eject(key) {
        if (!key || typeof key !== "string") {
            throw new TypeError("Param key should be of type string.");
        }
        const lines = await this._readLines();
        const newLines = lines.filter(line => {
            const [k,] = line.split("=", 2);
            return k !== key;
        });
        write(this.filename, newLines.join("\n"), "utf-8");
    }

    /**
     * Helper: Reads all lines from the file.
     * @returns {Promise<string[]>}
     */
    async _readLines() {
        try {
            const data = read(this.filename, "utf-8");
            return data.split("\n").filter(line => line.trim() !== "");
        } catch (err) {
            console.error({ err });
            throw new Error(`Failed to read file: ${err.message}`);
        }
    }
}

class DBStore {
    constructor() { }
    /**
     * Insert or update (in case of conflict) the key-value pairs
     * @param {string} key
     * @param {string} value
     */
    async store(key, value) {
        try {
            await createOrUpdateKVPair(key, value);
        } catch (err) {
            console.error({ error: err });
            throw err;
        }
    }

    /**
     * Returns the value for the key from the database
     * @param {string} key
     * @returns {Promise<string>}
     */
    async retrieve(key) {
        try {
            return await getKVPair(key);
        } catch (err) {
            console.error({ error: err });
            throw err;
        }
    }

    /**
     * Deletes a key-value pair from the database.
     * @param {string} key
     */
    async eject(key) {
        try {
            await deleteKVPair(key);
        } catch (err) {
            console.error({ error: err });
            throw err;
        }
    }
}

const authStore = new KVStore(["memory", "file", "db"]);
const tokenStore = new KVStore(["memory"]);

export { KVStore, authStore, tokenStore };
