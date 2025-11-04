import { UPLOAD_DIR, CERTS_DIR, setupDirectories } from "../../src/utils/fs.js";
import { test, beforeEach, afterEach, expect, jest } from "@jest/globals";

beforeEach(() => {
    jest.restoreAllMocks();
});

afterEach(() => {
    jest.restoreAllMocks();
});

test("UPLOAD_DIR and CERTS_DIR end with expected folder names and are distinct", () => {
    expect(UPLOAD_DIR.split("/").pop()).toBe("uploads");
    expect(CERTS_DIR.split("/").pop()).toBe("certs");
    expect(UPLOAD_DIR).not.toBe(CERTS_DIR);
});

test("setupDirectories creates missing directories and logs creation (both missing)", () => {
    const exists = jest.fn().mockReturnValue(false);
    const mkdir = jest.fn();
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    setupDirectories({ exists, mkdir });

    expect(exists).toHaveBeenCalledTimes(2);
    expect(mkdir).toHaveBeenCalledTimes(2);
    expect(mkdir).toHaveBeenCalledWith(UPLOAD_DIR, { recursive: true });
    expect(mkdir).toHaveBeenCalledWith(CERTS_DIR, { recursive: true });
    expect(logSpy).toHaveBeenCalled();
    expect(logSpy.mock.calls.some(c => c.join(" ").includes("Created directory"))).toBe(true);
});

test("setupDirectories creates only the missing directory when one exists", () => {
    const exists = jest.fn((dir) => dir === UPLOAD_DIR); // UPLOAD_DIR exists, CERTS_DIR missing
    const mkdir = jest.fn();
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    setupDirectories({ exists, mkdir });

    expect(exists).toHaveBeenCalledTimes(2);
    expect(mkdir).toHaveBeenCalledTimes(1);
    expect(mkdir).toHaveBeenCalledWith(CERTS_DIR, { recursive: true });
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toContain("[setupDirectories]");
});

test("setupDirectories does nothing when directories already exist", () => {
    const exists = jest.fn().mockReturnValue(true);
    const mkdir = jest.fn();
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    setupDirectories({ exists, mkdir });

    expect(exists).toHaveBeenCalledTimes(2);
    expect(mkdir).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
});

test("setupDirectories logs error and rethrows when mkdir throws", () => {
    const exists = jest.fn().mockReturnValue(false);
    const mkdir = jest.fn(() => { throw new Error("Unrelated Error"); });
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => setupDirectories({ exists, mkdir })).toThrow("Unrelated Error");
    expect(errorSpy).toHaveBeenCalledWith(
        "[setupDirectories] Error creating directories:",
        "Unrelated Error"
    );
});
