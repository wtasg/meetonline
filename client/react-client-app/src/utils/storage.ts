import { createCookie, deleteCookie, readCookie, CookieOptions } from "./cookie";

type StorageType = "local" | "session" | "memory" | "cookie";

interface IStorage {
    store(key: string, value: string): void;
    retrieve(key: string): string | null | undefined;
    eject(key: string): void;
}

interface CookieStorageOptions extends CookieOptions {
    prefix?: string;
}

/**
 * Unified storage abstraction supporting multiple storage backends.
 * Falls through storage types in order until a value is found on retrieval.
 */
class Storage {
    private storages: IStorage[] = [];

    /**
     * Creates a new Storage instance with the specified storage backends.
     * @param {StorageType[]} [types=['memory']] - Array of storage types to use, in order of priority.
     */
    constructor(types: StorageType[] = ["memory"]) {
        types.forEach((type) => {
            let storage: IStorage | undefined;
            switch (type) {
                case "local":
                    if (typeof localStorage !== "undefined") {
                        storage = new LocalStorage();
                    }
                    break;
                case "session":
                    if (typeof sessionStorage !== "undefined") {
                        storage = new SessionStorage();
                    }
                    break;
                case "memory":
                    storage = new MemoryStorage();
                    break;
                case "cookie":
                    storage = new CookieStorage();
                    break;
                default:
                    storage = new MemoryStorage();
                    break;
            }
            if (storage) {
                this.storages.push(storage);
            }
        });

        if (this.storages.length === 0) {
            this.storages.push(new MemoryStorage());
        }
    }

    /**
     * Stores a value in all configured storage backends.
     * @param {string} key - The storage key.
     * @param {string} value - The value to store.
     * @returns {void}
     */
    store(key: string, value: string): void {
        this.storages.forEach((storage) => {
            try {
                storage.store(key, value);
            } catch (e) {
                console.error(`Failed to store in ${storage.constructor.name}:`, e);
            }
        });
    }

    /**
     * Retrieves a value from storage backends in order until found.
     * @param {string} key - The storage key.
     * @returns {(string|null)} The stored value, or null if not found in any backend.
     */
    retrieve(key: string): string | null {
        for (const storage of this.storages) {
            try {
                const value = storage.retrieve(key);
                if (value !== null && value !== undefined) {
                    return value;
                }
            } catch (e) {
                console.error(`Failed to retrieve from ${storage.constructor.name}:`, e);
            }
        }
        return null;
    }

    /**
     * Removes a value from all configured storage backends.
     * @param {string} key - The storage key to remove.
     * @returns {void}
     */
    eject(key: string): void {
        this.storages.forEach((storage) => {
            try {
                storage.eject(key);
            } catch (e) {
                console.error(`Failed to eject from ${storage.constructor.name}:`, e);
            }
        });
    }
}

class LocalStorage implements IStorage {
    store(key: string, value: string): void {
        localStorage.setItem(key, value);
    }

    retrieve(key: string): string | null {
        return localStorage.getItem(key);
    }

    eject(key: string): void {
        localStorage.removeItem(key);
    }
}

class SessionStorage implements IStorage {
    store(key: string, value: string): void {
        sessionStorage.setItem(key, value);
    }

    retrieve(key: string): string | null {
        return sessionStorage.getItem(key);
    }

    eject(key: string): void {
        sessionStorage.removeItem(key);
    }
}

class MemoryStorage implements IStorage {
    private storage: Record<string, string> = {};

    store(key: string, value: string): void {
        this.storage[key] = value;
    }

    retrieve(key: string): string | undefined {
        return this.storage[key];
    }

    eject(key: string): void {
        delete this.storage[key];
    }
}

class CookieStorage implements IStorage {
    private options: CookieStorageOptions;

    constructor(options: CookieStorageOptions = { prefix: "K_", Path: "/", "Max-Age": 7, SameSite: "strict" }) {
        this.options = options;
    }

    store(key: string, value: string): void {
        createCookie((this.options.prefix ?? "K_") + key, value, this.options);
    }

    retrieve(key: string): string | null {
        return readCookie((this.options.prefix ?? "K_") + key);
    }

    eject(key: string): void {
        deleteCookie((this.options.prefix ?? "K_") + key);
    }
}

export {
    Storage
};

export type { StorageType, IStorage, CookieStorageOptions };
