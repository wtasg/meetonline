import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";

const WEB_URL = "https://localhost";
// HTTPS issues with browsers, might be related to accepting https self-signed certificates.
const SECURE_WEB_URL = "https://localhost:5174";
const PATH = WEB_URL;

test("has title", async ({ page }) => {
    await page.goto(PATH);
    await expect(page).toHaveTitle(/meet online client react app/);
});

test("has home, login, and signup links", async ({ page }) => {
    await page.goto(PATH);
    await expect(page.getByRole("link", { name: "home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "login" })).toBeVisible();
    await expect(page.getByRole("link", { name: "signup" })).toBeVisible();
});

test("clicking /login takes user to /login page", async ({ page }) => {
    await page.goto(PATH);
    await expect(page.getByRole("link", { name: "login" })).toBeVisible();
    await page.getByRole("link", { name: "login" }).filter({ visible: true }).click();
    // await page.goto(`${PATH}/login`);
    await page.waitForURL("**/login");
    expect(page.url().endsWith("/login")).toBe(true);
    // await expect(page.getByText("Login")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
    await expect(page.getByPlaceholder("login_username")).toBeVisible();
    await expect(page.locator("input#login_username")).toBeVisible();
});


test("clicking /signup takes user to /signup page", async ({ page }) => {
    await page.goto(PATH);
    await expect(page.getByRole("link", { name: "signup" })).toBeVisible();
    await page.getByRole("link", { name: "signup" }).filter({ visible: true }).click();
    await page.waitForURL("**/signup");
    expect(page.url().endsWith("/signup")).toBe(true);
    await expect(page.getByRole("heading", { name: "Signup" })).toBeVisible();
    await expect(page.getByPlaceholder("signup_username")).toBeVisible();
    await expect(page.locator("input#signup_username")).toBeVisible();
});


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

    const username = uuidv4();
    const password = uuidv4();

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
