import { createCookie, deleteCookie, readCookie } from "./cookie";

class Storage {
    constructor(types = ["memory"]) {
        this.storages = [];
        types.forEach((type) => {
            let storage;
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

    store(key, value) {
        this.storages.forEach((storage) => {
            try {
                storage.store(key, value);
            } catch (e) {
                console.error(`Failed to store in ${storage.constructor.name}:`, e);
            }
        });
    }

    retrieve(key) {
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

    eject(key) {
        this.storages.forEach((storage) => {
            try {
                storage.eject(key);
            } catch (e) {
                console.error(`Failed to eject from ${storage.constructor.name}:`, e);
            }
        });
    }
}

class LocalStorage {
    store(key, value) {
        localStorage.setItem(key, value);
    }

    retrieve(key) {
        return localStorage.getItem(key);
    }

    eject(key) {
        localStorage.removeItem(key);
    }
}

class SessionStorage {
    store(key, value) {
        sessionStorage.setItem(key, value);
    }

    retrieve(key) {
        return sessionStorage.getItem(key);
    }

    eject(key) {
        sessionStorage.removeItem(key);
    }
}

class MemoryStorage {
    constructor() {
        this.storage = {};
    }
    store(key, value) {
        this.storage[key] = value;
    }

    retrieve(key) {
        return this.storage[key];
    }

    eject(key) {
        delete this.storage[key];
    }
}

class CookieStorage {
    constructor(options = { prefix: "K_", Expires: 7, Path: "/", "Max-Age": 7, SameSite: "strict" }) {
        this.options = options;
    }

    store(key, value) {
        createCookie(this.options.prefix + key, value, this.options);
    }
    retrieve(key) {
        return readCookie(this.options.prefix + key);
    }
    eject(key) {
        deleteCookie(this.options.prefix + key);
    }
}


export {
    Storage
};
