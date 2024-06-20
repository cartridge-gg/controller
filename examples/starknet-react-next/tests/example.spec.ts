import { test, expect, CDPSession } from "@playwright/test";

let client: CDPSession;
let authenticatorId: string;

test.beforeEach(async ({ page }) => {
  client = await page.context().newCDPSession(page);
  await client.send("WebAuthn.enable");
  const result = await client.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
  authenticatorId = result.authenticatorId;

  await page.goto("/");
});

test("has title", async ({ page }) => {
  await expect(page).toHaveTitle(/StarkNet ❤️ React/);
});

test.describe("Connect", () => {
  test.describe("Log in", () => {
    test("should allow me to login and connect to Controller", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "Connect" }).click();
      const modal = page.frameLocator("#cartridge-modal");
      await expect(
        modal.getByText("Play with Cartridge Controller"),
      ).toBeVisible();
      await modal.getByPlaceholder("Username").fill("test-0");
      await modal.getByRole("button", { name: "LOG IN" }).click();

      await expect(page.getByText("Address: ")).toBeVisible();
    });
  });
});
