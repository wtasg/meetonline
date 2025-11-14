import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";

import { PATH } from "./common.js";

test("can login", async ({ page }) => {
    // load page
    await page.goto(`${PATH}/signup`);
    await page.waitForURL("**/signup");

    // expect elements on the page
    await expect(page.locator("h2")).toBeVisible();
    await expect(page.getByPlaceholder("signup_username")).toBeVisible();
    await expect(page.locator("input#signup_username")).toBeVisible();
    await expect(page.getByPlaceholder("signup_password")).toBeVisible();
    await expect(page.locator("input#signup_password")).toBeVisible();
    await expect(page.locator("button", { name: "Signup" })).toBeVisible();

    const username = uuidv4().toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 12);
    const password = uuidv4().toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 32);

    // fill the form
    await page.locator("input#signup_username").fill(username);
    await page.locator("input#signup_password").fill(password);
    await page.locator("button", { name: "Signup" }).filter({ visible: true }).click();

    // load page
    await page.goto(`${PATH}/login`);
    await page.waitForURL("**/login");

    // expect elements on the page
    await expect(page.locator("h2")).toBeVisible();
    await expect(page.getByPlaceholder("login_username")).toBeVisible();
    await expect(page.locator("input#login_username")).toBeVisible();
    await expect(page.getByPlaceholder("login_password")).toBeVisible();
    await expect(page.locator("input#login_password")).toBeVisible();
    await expect(page.locator("button", { name: "Login" })).toBeVisible();

    // fill the form
    await page.locator("input#login_username").fill(username);
    await page.locator("input#login_password").fill(password);
    await page.locator("button", { name: "Login" }).filter({ visible: true }).click();

    // verify the page load etc?
});
