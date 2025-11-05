import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Storage } from "./storage.js";

describe("Storage", () => {
    describe("Memory Storage", () => {
        let storage;
        beforeEach(() => {
            storage = new Storage(["memory"]);
        });
        it("should store and retrieve a value", () => {
            storage.store("testKey", "testValue");
            const retrievedValue = storage.retrieve("testKey");
            expect(retrievedValue).toBe("testValue");
        });
        it("should eject a value", () => {
            storage.store("testKey", "testValue");
            storage.eject("testKey");
            const retrievedValue = storage.retrieve("testKey");
            expect(retrievedValue).toBeNull();
        });
    });

    describe("Local Storage", () => {
        let storage;
        beforeEach(() => {
            // Mock window.localStorage
            const mockStorage = {};
            vi.spyOn(window, "localStorage", "get").mockImplementation(() => ({
                setItem: vi.fn((key, value) => { mockStorage[key] = value; }),
                getItem: vi.fn((key) => mockStorage[key] || null),
                removeItem: vi.fn((key) => { delete mockStorage[key]; }),
            }));
            storage = new Storage(["local"]);
        });
        afterEach(() => {
            vi.restoreAllMocks();
        });
        it("should store and retrieve a value", () => {
            storage.store("testKey", "testValue");
            const retrievedValue = storage.retrieve("testKey");
            expect(retrievedValue).toBe("testValue");
        });
        it("should eject a value", () => {
            storage.store("testKey", "testValue");
            storage.eject("testKey");
            const retrievedValue = storage.retrieve("testKey");
            expect(retrievedValue).toBeNull();
        });
    });

    describe("Multi-Store", () => {
        let storage;
        beforeEach(() => {
            const mockLocalStorage = {};
            vi.spyOn(window, "localStorage", "get").mockImplementation(() => ({
                setItem: vi.fn((key, value) => { mockLocalStorage[key] = value; }),
                getItem: vi.fn((key) => mockLocalStorage[key] || null),
                removeItem: vi.fn((key) => { delete mockLocalStorage[key]; }),
            }));
            storage = new Storage(["memory", "local"]);
        });
        afterEach(() => {
            vi.restoreAllMocks();
        });
        it("should store and retrieve a value from all stores", () => {
            storage.store("testKey", "testValue");
            const retrievedValue = storage.retrieve("testKey");
            expect(retrievedValue).toBe("testValue");
        });
        it("should eject a value from all stores", () => {
            storage.store("testKey", "testValue");
            storage.eject("testKey");
            const retrievedValue = storage.retrieve("testKey");
            expect(retrievedValue).toBeNull();
        });
    });
});
