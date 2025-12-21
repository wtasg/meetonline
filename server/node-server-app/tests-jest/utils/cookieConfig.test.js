import { COOKIE_CLEAR_OPTIONS } from "../../src/utils/cookieConfig.js";

describe("cookieConfig", () => {
    describe("COOKIE_CLEAR_OPTIONS", () => {
        it("should have domain set to localhost", () => {
            expect(COOKIE_CLEAR_OPTIONS.domain).toBe("meet.online");
        });

        it("should have path set to /", () => {
            expect(COOKIE_CLEAR_OPTIONS.path).toBe("/");
        });

        it("should be an object", () => {
            expect(typeof COOKIE_CLEAR_OPTIONS).toBe("object");
        });

        it("should not be null", () => {
            expect(COOKIE_CLEAR_OPTIONS).not.toBeNull();
        });
    });
});
