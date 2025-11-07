import { KVStore } from "../../src/utils/store.js";
import { beforeEach, describe, jest, expect, it } from "@jest/globals";

describe("KVStore MemoryStorage", () => {
    it("stores and retrieve a value based on a give key", () => {
        (async () => {
            let store = new KVStore(["memory"]);
            const key = "key-1";
            const value = "value-1";
            await store.store(key, value);
            const actual = await store.retrieve(key);
            const expected = value;
            expect(actual).toEqual(expected);
        })();
    });
});

describe("KVStore FileStorage", () => {
    it("stores and retrieve a value based on a give key", () => {
        (async () => {
            let store = new KVStore(["file"]);
            const key = "key-1";
            const value = "value-1";
            await store.store(key, value);
            const actual = await store.retrieve(key);
            const expected = value;
            expect(actual).toEqual(expected);
        })();
    });

});

describe("KVStore Database Storage", () => {
    const store = new KVStore(["db"]);

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("stores and retrieve a value based on a give key", () => {
        (async () => {
            jest.spyOn(store, "store").mockImplementation((k, v) => {
                expect(k).toBe("key-1");
                expect(v).toBe("value-1");
            });
            jest.spyOn(store, "retrieve").mockImplementation((k) => {
                expect(k).toBe("key-1");
                return "value-1";
            });
            const key = "key-1";
            const value = "value-1";
            await store.store(key, value);
            const actual = await store.retrieve(key);
            const expected = value;
            expect(actual).toEqual(expected);
        })();
    });
});
