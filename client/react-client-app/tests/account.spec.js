// import { test, expect } from "@playwright/test";
// import { login, signup, ACCOUNT_PATH, APP_ROOT } from "./common";

// async function visitAccountPage(page) {
//     if (!page) {
//         throw new Error("page not available");
//     }

//     // load page
//     await page.getByRole("link", { href: ACCOUNT_PATH }).click();
//     await expect(ACCOUNT_PATH).toBe("/account");
//     // await page.goto(`${APP_ROOT}${ACCOUNT_PATH}`);
//     await page.waitForURL(`**${ACCOUNT_PATH}`);
//     await page.waitForLoadState("networkidle");
//     await page.waitForLoadState("domcontentloaded");
//     console.log(await page.content());
//     await page.screenshot({ path: "account.png", fullPage: true });
//     await expect(page.getByRole("heading", { name: "User Account" })).toBeVisible();
//     // expect elements on the page
//     await page.locator("h2").scrollIntoViewIfNeeded();
//     await expect(page.getByText("User Account")).toHaveText("User Account");
//     await expect(page.locator("h2")).toHaveText("User Account");
//     await expect(page.locator("div.vflex h2")).toHaveText("User Account");
// }

// async function verifyUsernameOnAccountPage(page, username) {
//     if (!page) {
//         throw new Error("page not available");
//     }
//     if (!username) {
//         throw new Error("username not available");
//     }

//     await expect(page.getByText(username)).toBeVisible();
// }

// // test("account page", async ({ page }) => {
// //     const signed = await signup(page);
// //     page = signed.page;
// //     const { username, password } = signed;
// //     page = (await login(page, username, password)).page;
// //     await visitAccountPage(page);
// //     await verifyUsernameOnAccountPage(page, username);
// // });

// // // chatGPT help: incomplete: https://chatgpt.com/share/69255608-b418-8011-b32b-ee2e54d1fb0d
// // test.describe("Account Page idiomatic", () => {
// //     test.use({
// //         viewport: { width: 1200, height: 900 },
// //     });

// //     test("user can visit account page and see username", async ({ page }) => {
// //         //
// //         // 1. Sign up and log in
// //         //
// //         const { username, password } = await signup(page);
// //         await login(page, username, password);

// //         //
// //         // 2. Navigate to /account
// //         //
// //         await page.goto(`${APP_ROOT}${ACCOUNT_PATH}`);
// //         await expect(page).toHaveURL(new RegExp(`${ACCOUNT_PATH}$`));

// //         //
// //         // 3. Assert H2 is visible
// //         //
// //         const heading = page.getByRole("heading", { name: "User Account", level: 2 });
// //         await expect(heading).toBeVisible();

// //         //
// //         // 4. Assert username is visible
// //         //
// //         await expect(page.getByText(username, { exact: true })).toBeVisible();
// //     });
// // });
