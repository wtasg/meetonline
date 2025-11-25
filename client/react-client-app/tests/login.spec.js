import { test } from "@playwright/test";

import { login, signup } from "./common.js";


test("can login", async ({ page }) => {
    const { username, password } = await signup(page);
    await login(page, username, password);
});
