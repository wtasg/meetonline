import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createCookie, readAllCookies, readCookie } from "./cookie";
import { UTC } from "./date";

describe("Cookie", () => {
    let documentCookieMock;

    beforeEach(() => {
        documentCookieMock = Object.getOwnPropertyDescriptor(document, "cookie");

        let cookieStore = "";
        Object.defineProperty(document, "cookie", {
            get: () => cookieStore,
            set: (val) => {
                cookieStore = val;
            },
            configurable: true
        });
    });

    afterEach(() => {
        if (documentCookieMock) {
            Object.defineProperty(document, "cookie", documentCookieMock);
        }
    });
    describe("readAllCookies", () => {
        it("should return empty object when no cookies exist", () => {
            expect(readAllCookies()).toEqual([]);
        });
    });

    describe("readCookie", () => {
        it("should return empty object", () => {
            expect(readCookie()).toEqual([]);
        });
    });

    describe("createCookie", () => {
        it("should create a cookie successfully", () => {
            const actual = createCookie("name", "value", {});
            const expected = `name=value; Expires=${UTC.someday(7)}; Path=/; Max-Age=7; SameSite=strict`;
            expect(actual).toBe(expected);
        });
    });
});
