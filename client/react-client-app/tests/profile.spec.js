// import { test, expect } from "@playwright/test";
// import { v4 as uuidv4 } from "uuid";

// import { APP_ROOT, PROFILE_PATH, login } from "./common.js";

// test.describe("User Profile", () => {

//     test("logged-in user can navigate to /profile page", async ({ page }) => {

//         await login(page);
//         await page.goto(APP_ROOT);
//         // Navigate to profile via menu link
//         await page.getByRole("link", { name: "profile" }).click();
//         await page.waitForURL(`**${PROFILE_PATH}`);

//         // Verify URL
//         expect(page.url().endsWith(PROFILE_PATH)).toBe(true);
//     });

//     test("profile page displays heading and field labels", async ({ page }) => {
//         await login(page);
//         await page.goto(APP_ROOT);

//         // Navigate to profile via menu link
//         await page.getByRole("link", { name: "profile" }).click();
//         await page.waitForURL(`**${PROFILE_PATH}`);
//         await page.waitForLoadState("networkidle");

//         // Verify heading
//         await expect(page.getByRole("heading", { name: "User Profile" })).toBeVisible();

//         // Verify instruction text
//         await expect(page.getByText("Change and hit enter to save.")).toBeVisible();

//         // Verify all field labels are present
//         await expect(page.getByText("Profile Name")).toBeVisible();
//         await expect(page.getByText("Display Name")).toBeVisible();
//         await expect(page.getByText("Phone Number")).toBeVisible();
//         await expect(page.getByText("Email")).toBeVisible();
//         await expect(page.getByText("Address")).toBeVisible();
//         await expect(page.getByText("Website URL")).toBeVisible();
//         await expect(page.getByText("Created At")).toBeVisible();
//         await expect(page.getByText("Modified At")).toBeVisible();
//     });

//     test("profile page loads with default display name for new user", async ({ page }) => {
//         await login(page);
//         await page.goto(`${APP_ROOT}${PROFILE_PATH}`);
//         await page.waitForLoadState("networkidle");

//         // New users get a default display name
//         const displayNameInput = page.locator(".editable input").nth(1);
//         await expect(displayNameInput).toHaveValue("default profile displayName");
//     });

//     test("user can edit display name field", async ({ page }) => {
//         await login(page);
//         await page.goto(`${APP_ROOT}${PROFILE_PATH}`);
//         await page.waitForLoadState("networkidle");

//         // Find the display name input (second editable field)
//         const displayNameInput = page.locator(".editable input").nth(1);
//         const newDisplayName = `Test User ${uuidv4().slice(0, 8)}`;

//         // Clear and fill new value
//         await displayNameInput.clear();
//         await displayNameInput.fill(newDisplayName);

//         // Verify dirty indicator appears
//         await expect(page.locator(".editable").nth(1).getByText("*")).toBeVisible();

//         // Press Enter to save
//         await displayNameInput.press("Enter");

//         // Verify dirty indicator disappears after save
//         await expect(page.locator(".editable").nth(1).getByText("*")).not.toBeVisible();

//         // Verify the value is still there
//         await expect(displayNameInput).toHaveValue(newDisplayName);
//     });

//     test("user can edit email field", async ({ page }) => {
//         await login(page);
//         await page.goto(`${APP_ROOT}${PROFILE_PATH}`);
//         await page.waitForLoadState("networkidle");

//         // Find the email input (fourth editable field, index 3)
//         const emailInput = page.locator(".editable input").nth(3);
//         const newEmail = `test${uuidv4().slice(0, 8)}@example.com`;

//         // Clear and fill new value
//         await emailInput.clear();
//         await emailInput.fill(newEmail);

//         // Verify dirty indicator appears
//         await expect(page.locator(".editable").nth(3).getByText("*")).toBeVisible();

//         // Press Enter to save
//         await emailInput.press("Enter");

//         // Verify dirty indicator disappears after save
//         await expect(page.locator(".editable").nth(3).getByText("*")).not.toBeVisible();

//         // Verify the value is still there
//         await expect(emailInput).toHaveValue(newEmail);
//     });

//     test("user can edit phone number field", async ({ page }) => {
//         await login(page);
//         await page.goto(`${APP_ROOT}${PROFILE_PATH}`);
//         await page.waitForLoadState("networkidle");

//         // Find the phone number input (third editable field, index 2)
//         const phoneInput = page.locator(".editable input").nth(2);
//         const newPhone = `+1-555-${Math.floor(Math.random() * 10000000).toString().padStart(7, "0")}`;

//         // Clear and fill new value
//         await phoneInput.clear();
//         await phoneInput.fill(newPhone);

//         // Press Enter to save
//         await phoneInput.press("Enter");

//         // Verify the value is still there
//         await expect(phoneInput).toHaveValue(newPhone);
//     });

//     test("edited values persist after page reload", async ({ page }) => {
//         await login(page);
//         await page.goto(`${APP_ROOT}${PROFILE_PATH}`);
//         await page.waitForLoadState("networkidle");

//         // Find the display name input and set a unique value
//         const displayNameInput = page.locator(".editable input").nth(1);
//         const uniqueDisplayName = `Persist Test ${uuidv4().slice(0, 8)}`;

//         // Edit and save
//         await displayNameInput.clear();
//         await displayNameInput.fill(uniqueDisplayName);
//         await displayNameInput.press("Enter");

//         // Wait for save to complete
//         await page.waitForTimeout(500);

//         // Reload the page
//         await page.reload();
//         await page.waitForLoadState("networkidle");

//         // Verify the value persisted
//         const reloadedInput = page.locator(".editable input").nth(1);
//         await expect(reloadedInput).toHaveValue(uniqueDisplayName);
//     });

// });
