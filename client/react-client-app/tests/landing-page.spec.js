import { test, expect } from "@playwright/test";

const WEB_URL = "http://localhost:5173/";
// HTTPS issues with browsers, might be related to accepting https self-signed certificates.
const SECURE_WEB_URL = "https://localhost:5174/";
const PATH = WEB_URL;

test("has title", async ({ page }) => {
    await page.goto(PATH);
    await expect(page).toHaveTitle(/meet online client react app/);
});

test("has login and signup buttons", async ({ page }) => {
    await page.goto(PATH);
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("button", { name: "Signup" })).toBeVisible();
});
