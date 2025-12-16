import { expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";

const WEB_URL = "https://localhost:5180";
// HTTPS issues with browsers, might be related to accepting https self-signed certificates.
const SECURE_WEB_URL = "https://localhost:5174";
const APP_ROOT = WEB_URL;
const LOGIN_PATH = "/login";
const SIGNUP_PATH = "/signup";
const ACCOUNT_PATH = "/account";
const PROFILE_PATH = "/profile";

/**
 *
 * @param {import('@playwright/test').Page} page
 * @param {string?} username
 * @param {string?} password
 * @returns {{username: string, password: string, page: any}}
 */
async function login(page, username, password) {
    if (!page) {
        throw new Error("page not available");
    }
    if (!username || !password) {
        const signedup = await signup(page);
        username = signedup.username;
        password = signedup.password;
    }
    // load page
    await page.goto(`${APP_ROOT}`);
    await page.getByRole("link", { name: "login" }).filter({ visible: true }).first().click();

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

    return { username, password, page };
}

/**
 *
 * @param {import('@playwright/test').Page} page
 * @param {string?} username
 * @param {string?} password
 * @returns {{username: string, password: string, page: any}}
 */
async function signup(page, username, password) {
    if (!page) {
        throw new Error("page not available");
    }
    if (!username) {
        username = uuidv4().toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 12);
    }
    if (!password) {
        password = uuidv4().toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 32);
    }
    // load page
    await page.goto(`${APP_ROOT}`);
    await page.getByRole("link", { name: "signup" }).filter({ visible: true }).click();

    // expect elements on the page
    await expect(page.locator("h2")).toBeVisible();
    await expect(page.getByPlaceholder("signup_username")).toBeVisible();
    await expect(page.locator("input#signup_username")).toBeVisible();
    await expect(page.getByPlaceholder("signup_password")).toBeVisible();
    await expect(page.locator("input#signup_password")).toBeVisible();
    await expect(page.locator("button", { name: "Signup" })).toBeVisible();

    // fill the form
    await page.locator("input#signup_username").fill(username);
    await page.locator("input#signup_password").fill(password);
    await page.locator("button", { name: "Signup" }).filter({ visible: true }).click();

    return { username, password, page };
}

export {
    APP_ROOT,
    LOGIN_PATH,
    SIGNUP_PATH,
    ACCOUNT_PATH,
    PROFILE_PATH,
    login,
    signup,
};
