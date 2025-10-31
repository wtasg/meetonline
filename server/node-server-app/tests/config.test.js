import { SERVER_PORT, DB_PORT, DB_USER, DB_PASS, DB_NAME, DB_HOST } from "../src/config";

test("server port should be no and correct value ", () => {
    expect(typeof SERVER_PORT).toBe("number");
    expect(SERVER_PORT).toBe(9006);
});

test("DB port should be no and correct value ", () => {
    expect(typeof DB_PORT).toBe("number");
    expect(DB_PORT).toBe(54321);
});

test("DB user should be string", () => {
    expect(typeof DB_USER).toBe("string");
});

test("DB password should be string", () => {
    expect(typeof DB_PASS).toBe("string");
});

test("DB name to be string", () => {
    expect(typeof DB_NAME).toBe("string");
});

test("DB host should be string and has correct values ", () => {
    expect(typeof DB_HOST).toBe("string");
    expect(DB_HOST).toBe("localhost");
});
