import { describe, it, expect, vi, beforeEach } from "vitest";
import { userAccount } from "../net/userAccount.js";
import { CONF } from "../net/net-conf.js";

describe("Debounced userAccount", () => {
    beforeEach(() => {
        vi.useFakeTimers();

        globalThis.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ ok: true })
            })
        );
    });

    it("calls fetch only once after 400ms delay", async () => {
        userAccount({ username: "test1" }).catch(() => {});
        userAccount({ username: "test2" }).catch(() => {});
        userAccount({ username: "test3" }).catch(() => {});

        expect(fetch).not.toHaveBeenCalled();

        vi.advanceTimersByTime(399);
        expect(fetch).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("passes the last argument to the debounced function", async () => {
        userAccount({ username: "A" }).catch(() => {});
        userAccount({ username: "B" }).catch(() => {});
        userAccount({ username: "C" }).catch(() => {});

        vi.advanceTimersByTime(400);

        expect(fetch).toHaveBeenCalledWith(
            `${CONF.HTTPS_SERVER}/${CONF.URLS.USER_ACCOUNT}`,
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({ username: "C" }) // correct
            })
        );
    });
});
