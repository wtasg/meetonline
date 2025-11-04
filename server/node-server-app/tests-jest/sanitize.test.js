import { sanitizeFilename } from "../src/utils/sanitize.js";
import { test, beforeEach, afterEach, expect, jest } from "@jest/globals";

beforeEach(() => {
    jest.restoreAllMocks();
});

afterEach(() => {
    jest.restoreAllMocks();
});

test("sanitizeFilename converts uppercase to lowercase", () => {
    const result = sanitizeFilename("MyFile.JPG");
    expect(result).toBe("myfile.jpg");
});

test("sanitizeFilename replaces invalid characters with underscores", () => {
    const result = sanitizeFilename("data@file#1!.txt");
    expect(result).toBe("data_file_1.txt");
});

test("sanitizeFilename removes emojis and non-ASCII characters", () => {
    const result = sanitizeFilename("Profile😎.jpg");
    expect(result).toBe("profile.jpg");
});

test("sanitizeFilename handles compound extensions like .tar.gz", () => {
    const result = sanitizeFilename("archive.tar.gz");
    expect(result).toBe("archive.tar.gz");
});

test("sanitizeFilename keeps hidden files like .env as-is", () => {
    const result = sanitizeFilename(".env");
    expect(result).toBe(".env");
});

test("sanitizeFilename throws error for invalid input", () => {
    expect(() => sanitizeFilename(null)).toThrow("Invalid filename input");
    expect(() => sanitizeFilename(undefined)).toThrow("Invalid filename input");
    expect(() => sanitizeFilename(123)).toThrow("Invalid filename input");
});

test("sanitizeFilename handles mixed special cases together", () => {
    const result = sanitizeFilename("Test@File(1).tar.gz");
    expect(result).toBe("test_file_1.tar.gz");
});
