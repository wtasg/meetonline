import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Storage } from "./storage";

describe("Storage", () => {
    describe("Memory Storage", () => {
        let storage: Storage;
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
        let storage: Storage;
        beforeEach(() => {
            // Mock window.localStorage
            const mockStorage: Record<string, string> = {};
            vi.spyOn(window, "localStorage", "get").mockImplementation(() => ({
                setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
                getItem: vi.fn((key: string) => mockStorage[key] || null),
                removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
                clear: vi.fn(),
                key: vi.fn(),
                length: 0
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
        let storage: Storage;
        beforeEach(() => {
            const mockLocalStorage: Record<string, string> = {};
            vi.spyOn(window, "localStorage", "get").mockImplementation(() => ({
                setItem: vi.fn((key: string, value: string) => { mockLocalStorage[key] = value; }),
                getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
                removeItem: vi.fn((key: string) => { delete mockLocalStorage[key]; }),
                clear: vi.fn(),
                key: vi.fn(),
                length: 0
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
