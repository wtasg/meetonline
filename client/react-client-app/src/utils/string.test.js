import { describe, it, expect } from "vitest";
import { isEmptyOrNull, isEmptyString, isNonEmptyString } from "./string.js";

describe("string utils", () => {
    describe("isEmptyOrNull", () => {
        it("returns true for null", () => {
            expect(isEmptyOrNull(null)).toBe(true);
        });

        it("returns true for undefined", () => {
            expect(isEmptyOrNull(undefined)).toBe(true);
        });

        it("returns true for empty string", () => {
            expect(isEmptyOrNull("")).toBe(true);
        });

        it("returns true for whitespace-only string", () => {
            expect(isEmptyOrNull("   ")).toBe(true);
            expect(isEmptyOrNull("\t")).toBe(true);
            expect(isEmptyOrNull("\n")).toBe(true);
            expect(isEmptyOrNull(" \t\n ")).toBe(true);
        });

        it("returns false for non-empty string", () => {
            expect(isEmptyOrNull("hello")).toBe(false);
            expect(isEmptyOrNull("test")).toBe(false);
        });

        it("returns false for string with content and whitespace", () => {
            expect(isEmptyOrNull("  hello  ")).toBe(false);
            expect(isEmptyOrNull("\ttest\n")).toBe(false);
        });

        it("returns false for non-string values", () => {
            expect(isEmptyOrNull(0)).toBe(false);
            expect(isEmptyOrNull(123)).toBe(false);
            expect(isEmptyOrNull(false)).toBe(false);
            expect(isEmptyOrNull(true)).toBe(false);
            expect(isEmptyOrNull({})).toBe(false);
            expect(isEmptyOrNull([])).toBe(false);
        });
    });

    describe("isEmptyString", () => {
        it("returns true for empty string", () => {
            expect(isEmptyString("")).toBe(true);
        });

        it("returns true for whitespace-only string", () => {
            expect(isEmptyString("   ")).toBe(true);
            expect(isEmptyString("\t")).toBe(true);
            expect(isEmptyString("\n")).toBe(true);
            expect(isEmptyString(" \t\n ")).toBe(true);
        });

        it("returns false for non-empty string", () => {
            expect(isEmptyString("hello")).toBe(false);
            expect(isEmptyString("test")).toBe(false);
        });

        it("returns false for string with content and whitespace", () => {
            expect(isEmptyString("  hello  ")).toBe(false);
            expect(isEmptyString("\ttest\n")).toBe(false);
        });

        it("returns false for null", () => {
            expect(isEmptyString(null)).toBe(false);
        });

        it("returns false for undefined", () => {
            expect(isEmptyString(undefined)).toBe(false);
        });

        it("returns false for non-string values", () => {
            expect(isEmptyString(0)).toBe(false);
            expect(isEmptyString(123)).toBe(false);
            expect(isEmptyString(false)).toBe(false);
            expect(isEmptyString(true)).toBe(false);
            expect(isEmptyString({})).toBe(false);
            expect(isEmptyString([])).toBe(false);
        });
    });

    describe("isNonEmptyString", () => {
        it("returns true for non-empty string", () => {
            expect(isNonEmptyString("hello")).toBe(true);
            expect(isNonEmptyString("test")).toBe(true);
        });

        it("returns true for string with content and whitespace", () => {
            expect(isNonEmptyString("  hello  ")).toBe(true);
            expect(isNonEmptyString("\ttest\n")).toBe(true);
        });

        it("returns false for empty string", () => {
            expect(isNonEmptyString("")).toBe(false);
        });

        it("returns false for whitespace-only string", () => {
            expect(isNonEmptyString("   ")).toBe(false);
            expect(isNonEmptyString("\t")).toBe(false);
            expect(isNonEmptyString("\n")).toBe(false);
            expect(isNonEmptyString(" \t\n ")).toBe(false);
        });

        it("returns false for null", () => {
            expect(isNonEmptyString(null)).toBe(false);
        });

        it("returns false for undefined", () => {
            expect(isNonEmptyString(undefined)).toBe(false);
        });

        it("returns false for non-string values", () => {
            expect(isNonEmptyString(0)).toBe(false);
            expect(isNonEmptyString(123)).toBe(false);
            expect(isNonEmptyString(false)).toBe(false);
            expect(isNonEmptyString(true)).toBe(false);
            expect(isNonEmptyString({})).toBe(false);
            expect(isNonEmptyString([])).toBe(false);
        });
    });
});
