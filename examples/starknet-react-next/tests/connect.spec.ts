import { test, expect } from "@playwright/test";
import { WebauthnEmulator } from "./webauthn";
import { Keychain } from "./keychain";

test.beforeEach(async ({ page }) => {
  await page.goto("/");

  const client = await page.context().newCDPSession(page);
  const webauthn = new WebauthnEmulator({ client });

  await webauthn.enable();
  await webauthn.addVirtualAuthenticator();
});

test("Sign up -> Disconnect -> Log in", async ({ page }) => {
  const keychain = new Keychain({ page });

  await keychain.signup();
  await keychain.session();
  await keychain.disconnect();
  await keychain.login();

  await expect(page.getByText(`Username: ${keychain.username}`)).toBeVisible();
});
