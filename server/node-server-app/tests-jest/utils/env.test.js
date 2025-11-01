import { test, expect } from '@jest/globals';

import { loadEnv } from "../../src/utils/env.js";

test("loadEnv can load local.env without passing a value", () => {
    const out = loadEnv();
    expect(Object.keys(out).length).toBe(2);

    const { envRel, envPath } = out;
    expect(envRel.endsWith('local.env')).toBeTruthy();
    expect(envPath.endsWith('server/node-server-app/local.env')).toBeTruthy();
});

test("loadEnv with load local.env for non-development stage value", () => {
    const { envRel, envPath } = loadEnv("testing");
    expect(envRel.endsWith('local.env')).toBeTruthy();
    expect(envPath.endsWith('server/node-server-app/local.env')).toBeTruthy();
});
