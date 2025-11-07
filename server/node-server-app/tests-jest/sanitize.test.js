import { removeConsecutiveSpaces, sanitizeFilename } from "../src/utils/sanitize.js";
import { test, expect, describe, it, jest } from "@jest/globals";

jest.useFakeTimers();

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

test("sanitizeFilename handles mixed special cases together", () => {
    const result = sanitizeFilename("Test@File(1).tar.gz");
    expect(result).toBe("test_file_1.tar.gz");
});

test("sanitizeFilename fails", () => {
    const actual = sanitizeFilename("___file  _  name . . .env");
    const expected = "file_name.env";
    expect(actual).toBe(expected);
});

test("sanitizeFilename doesn't throw error if it is longer than expected", () => {
    expect(sanitizeFilename("a".repeat(256))).toBe("a".repeat(255));
});

describe("removeConsecutiveSpaces", () => {
    it("should remove consecutive spaces and convert to single space", () => {
        const input = "wha  t   is     going   on with    space      s   ?";
        const actual = removeConsecutiveSpaces(input);
        const expected = "wha t is going on with space s ?";
        expect(actual).toBe(expected);
    });
    it("should return string as it is when there are no spaces", () => {
        const input = "ThereAreNoSpaces!";
        const actual = removeConsecutiveSpaces(input);
        const expected = "ThereAreNoSpaces!";
        expect(actual).toBe(expected);
    });

    it("should throw error if the input is 1025 characters long", () => {
        expect(() => removeConsecutiveSpaces("a".repeat(1025))).toThrow("Param input is too long. (1024+)");
    });
});
