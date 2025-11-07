import { test, expect } from "@jest/globals";

import { loadEnv } from "../../src/utils/env.js";

test("loadEnv can load docker.env without passing a value", () => {
    const out = loadEnv();
    expect(Object.keys(out).length).toBe(2);

    const { envRel, envPath } = out;
    expect(envRel.endsWith("docker.env")).toBeTruthy();
    expect(envPath.endsWith("server/node-server-app/docker.env")).toBeTruthy();
});

test("loadEnv with load docker.env for non-development stage value", () => {
    const { envRel, envPath } = loadEnv("testing");
    expect(envRel.endsWith("docker.env")).toBeTruthy();
    expect(envPath.endsWith("server/node-server-app/docker.env")).toBeTruthy();
});
