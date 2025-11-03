import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { today, tomorrow, yesterday } from "./date.js";

describe("date utils", () => {
    const base = new Date("2020-01-01T12:00:00Z");

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(base);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("today() returns current date as UTC string", () => {
        expect(typeof today()).toBe("string");
        expect(today()).toBe(new Date(base).toUTCString());
    });

    it("tomorrow() returns next day as UTC string", () => {
        const expected = new Date(base.getTime() + 24 * 60 * 60 * 1000).toUTCString();
        expect(tomorrow()).toBe(expected);
    });

    it("yesterday() returns previous day as UTC string", () => {
        const expected = new Date(base.getTime() - 24 * 60 * 60 * 1000).toUTCString();
        expect(yesterday()).toBe(expected);
    });

    it("today, tomorrow and yesterday produce distinct values", () => {
        const t = today();
        const tom = tomorrow();
        const y = yesterday();
        expect(t).not.toBe(tom);
        expect(t).not.toBe(y);
        expect(tom).not.toBe(y);
    });
});
