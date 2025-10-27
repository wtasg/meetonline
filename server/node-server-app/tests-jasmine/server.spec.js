import { SERVER_PORT } from "../src/server.js";

describe("server", () => {
    it("servers traffic on port 9006", () => {
        expect(SERVER_PORT).toEqual(9006);
    });
});
