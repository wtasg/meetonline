import { test, expect } from "@playwright/test";

import { APP_ROOT } from "./common.js";

test("has title", async ({ page }) => {
    await page.goto(APP_ROOT);
    await expect(page).toHaveTitle(/Meet Online/);
});

test("has home, login, and signup links", async ({ page }) => {
    await page.goto(APP_ROOT);
    await expect(page.getByRole("button", { name: "home" })).toBeVisible();
    await expect(page.getByRole("button", { name: "login" })).toBeVisible();
    await expect(page.getByRole("button", { name: "signup" })).toBeVisible();
});

test("clicking /login takes user to /login page", async ({ page }) => {
    await page.goto(APP_ROOT);
    await expect(page.getByRole("button", { name: "login" })).toBeVisible();
    await page.getByRole("button", { name: "login" }).filter({ visible: true }).click();
    // await page.goto(`${APP_ROOT}/login`);
    await page.waitForURL("**/login");
    expect(page.url().endsWith("/login")).toBe(true);
    // await expect(page.getByText("Login")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
    await expect(page.getByPlaceholder("login_username")).toBeVisible();
    await expect(page.locator("input#login_username")).toBeVisible();
});

test("clicking /signup takes user to /signup page", async ({ page }) => {
    await page.goto(APP_ROOT);
    await expect(page.getByRole("button", { name: "signup" })).toBeVisible();
    await page.getByRole("button", { name: "signup" }).filter({ visible: true }).click();
    await page.waitForURL("**/signup");
    expect(page.url().endsWith("/signup")).toBe(true);
    await expect(page.getByRole("heading", { name: "Signup" })).toBeVisible();
    await expect(page.getByPlaceholder("signup_username")).toBeVisible();
    await expect(page.locator("input#signup_username")).toBeVisible();
});
