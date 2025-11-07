import { beforeEach, describe, it, jest } from "@jest/globals";
import { getFormattedDate } from "../../src/utils/date.js";

describe("getFormattedDate", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    it("should return date in YYYY_MM_DD_HH_MM_SS format", () => {
        const result = getFormattedDate();

        expect(result).toMatch(/^\d{4}_\d{2}_\d{2}_\d{2}_\d{2}_\d{2}$/);

        const currentYear = new Date().getFullYear();

        expect(result.startsWith(currentYear.toString())).toBe(true);
    });
});
