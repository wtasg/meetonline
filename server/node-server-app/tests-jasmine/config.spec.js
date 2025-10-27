import { SERVER_PORT } from "../src/config.js";

describe("config", () => {
    it("servers traffic on port 9006", () => {
        expect(SERVER_PORT).toEqual(9006);
    });
});
