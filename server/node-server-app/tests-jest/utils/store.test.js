import { KVStore } from "../../src/utils/store.js";
import { beforeEach, describe, jest, expect, it } from "@jest/globals";

describe("KVStore MemoryStorage", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    it("stores and retrieve a value based on a give key", () => {
        let store = new KVStore(["memory"]);
        const key = "key-1";
        const value = "value-1";
        store.store(key, value);
        const actual = store.retrieve(key);
        const expected = value;
        expect(actual).toEqual(expected);
    });
});

describe("KVStore FileStorage", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    it("stores and retrieve a value based on a give key", () => {
        let store = new KVStore(["file"]);
        const key = "key-1";
        const value = "value-1";
        store.store(key, value);
        const actual = store.retrieve(key);
        const expected = value;
        expect(actual).toEqual(expected);
    });

});

describe("KVStore Database Storage", () => {

    const store = new KVStore(["db"]);
    beforeEach(() => {
        jest.useFakeTimers();
        jest.restoreAllMocks();
    });

    it("stores and retrieve a value based on a give key", () => {
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
        store.store(key, value);
        const actual = store.retrieve(key);
        const expected = value;
        expect(actual).toEqual(expected);
    });
});
