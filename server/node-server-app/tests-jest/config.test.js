import { test } from "@jest/globals";

process.env.SERVER_HTTP_PORT = "9006";
process.env.SERVER_HTTPS_PORT = "9443";

import { SERVER_HTTP_PORT, SERVER_HTTPS_PORT, DB_PORT, DB_USER, DB_PASS, DB_NAME, DB_HOST } from "../src/config";

test("HTTP server port should be a number and correct value", () => {
    expect(Number(SERVER_HTTP_PORT)).toBe(9006);
});

test("HTTPS server port should be a number and correct value", () => {
    expect(Number(SERVER_HTTPS_PORT)).toBe(9443);
});

test("DB port should be a number and correct value ", () => {
    expect(typeof DB_PORT).toBe("number");
    expect(DB_PORT).toBe(54321);
});

test("DB user should be a string", () => {
    expect(typeof DB_USER).toBe("string");
});

test("DB password should be a string", () => {
    expect(typeof DB_PASS).toBe("string");
});

test("DB name to be a string", () => {
    expect(typeof DB_NAME).toBe("string");
});

test("DB host should be a string and has correct values ", () => {
    expect(typeof DB_HOST).toBe("string");
    expect(DB_HOST).toBe("localhost");
});
