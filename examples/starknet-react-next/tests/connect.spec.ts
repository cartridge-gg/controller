import { test, expect } from "@playwright/test";
import { WebauthnEmulator } from "./webauthn";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  const client = await page.context().newCDPSession(page);
  const webauthn = new WebauthnEmulator(client);
  await webauthn.enable();
  await webauthn.addVirtualAuthenticator();
});

test.describe("Sign up", () => {
  test("should allow user to sign up and connect to Controller", async ({
    page,
  }) => {
    await page.getByText("Connect").click();
    const modal = page.frameLocator("#cartridge-modal");

    await expect(
      modal.getByText("Play with Cartridge Controller"),
    ).toBeVisible();
    await expect(
      modal.getByText("Create your Cartridge Controller"),
    ).toBeVisible();

    const username = `test-${Date.now()}`;
    await modal.getByPlaceholder("Username").fill(username);
    await modal.getByText("SIGN UP").click();

    await expect(modal.getByText("Create Session").first()).toBeVisible();
    await modal.getByRole("button", { name: "CREATE SESSION" }).click();

    await expect(page.getByText(`Username: ${username}`)).toBeVisible();
  });
});

// test.describe("Log in", () => {
//   test("should allow me to login and connect to Controller", async ({
//     page,
//   }) => {
//     await page.getByText("Connect").click();
//     const modal = page.frameLocator("#cartridge-modal");
//     await modal.getByText("Log In").click();
//     await expect(
//       modal.getByText("Play with Cartridge Controller"),
//     ).toBeVisible();
//     await modal.getByPlaceholder("Username").fill("test-1");
//     await modal.getByText("LOG IN").click();

//     await expect(page.getByText("Address: ")).toBeVisible();
//   });
// });
