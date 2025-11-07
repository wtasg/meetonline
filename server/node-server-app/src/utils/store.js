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
     */
    store(key, value) {
        this.stores.forEach(s => s.store(key, value));
    }

    /**
     * Fetches the value for a given key.
     * @param {string} key The key for which the value will be retrieved
     * @returns {string|number}
     */
    retrieve(key) {
        if (!key || typeof key !== "string") {
            throw new TypeError("Param key should be of type string.");
        }
        if (this.stores.length < 1) {
            throw new Error("ERROR: no store available!");
        }
        for (const store of this.stores) {
            const value = store.retrieve(key);
            if (value !== null) {
                return value;
            }
        }
        return null;
    }

    /**
     * Removes the kv entry.
     * @param {string} key The key for which kv entry will be removed
     */
    eject(key) {
        this.stores.forEach(s => s.eject(key));
    }
}

class MemoryStore {
    constructor() {
        this.storage = {};
    }
    store(key, value) {
        this.storage[String(key)] = value;
    }
    retrieve(key) {
        return this.storage[String(key)] || null;
    }
    eject(key) {
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
    store(key, value) {
        if (!key || typeof key !== "string") {
            throw new TypeError("Param key should be of type string.");
        }
        const lines = this._readLines();
        const newLines = [];
        let updated = false;

        // Update existing key or add new key
        for (const line of lines) {
            const [k,] = line.split("=");
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
     * @returns {string|number|null}
     */
    retrieve(key) {
        if (!key || typeof key !== "string") {
            throw new TypeError("Param key should be of type string.");
        }
        const lines = this._readLines();
        for (const line of lines) {
            const [k, v] = line.split("=");
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
    eject(key) {
        if (!key || typeof key !== "string") {
            throw new TypeError("Param key should be of type string.");
        }
        const lines = this._readLines();
        const newLines = lines.filter(line => {
            const [k] = line.split("=");
            return k !== key;
        });
        write(this.filename, newLines.join("\n"), "utf-8");
    }

    /**
     * Helper: Reads all lines from the file.
     * @returns {string[]}
     */
    _readLines() {
        try {
            const data = read(this.filename, "utf-8");
            return data.split("\n").filter(line => line.trim() !== "");
        } catch (err) {
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
    store(key, value) {
        createOrUpdateKVPair(key, value).then(console.log).catch(console.error);
    }

    /**
     * Returns the value for the key from the database
     * @param {string} key
     * @returns {string} the value
     */
    retrieve(key) {
        return getKVPair(key).then(data => data).catch(console.error);
    }

    /**
     * Deletes a key-value pair from the database.
     * @param {string} key
     */
    eject(key) {
        deleteKVPair(key).then(console.log).catch(console.error);
    }
}

export { KVStore };
