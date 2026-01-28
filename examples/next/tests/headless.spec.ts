import { test, expect } from "@playwright/test";
import { WebauthnEmulator } from "./webauthn";

// Requires keychain running with VITE_E2E_MOCKS=true and the example app
// pointing at that keychain via NEXT_PUBLIC_KEYCHAIN_FRAME_URL.
const USE_MOCKS = process.env.E2E_MOCKS === "true";
const MOCK_EVM_ADDRESS = "0xF39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

test.describe.skip(!USE_MOCKS, "Requires E2E_MOCKS=true", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((address) => {
      // @ts-expect-error - test stub
      window.ethereum = {
        isMetaMask: true,
        request: async ({ method }: { method: string }) => {
          switch (method) {
            case "eth_requestAccounts":
            case "eth_accounts":
              return [address];
            case "eth_chainId":
              return "0x1";
            default:
              throw new Error(`Unsupported method: ${method}`);
          }
        },
        on: () => undefined,
        removeListener: () => undefined,
      };
    }, MOCK_EVM_ADDRESS);

    await page.goto("/");

    const client = await page.context().newCDPSession(page);
    const webauthn = new WebauthnEmulator({ client });
    await webauthn.enable();
    await webauthn.addVirtualAuthenticator();
  });

  test("headless passkey login", async ({ page }) => {
    await page.locator("#headless-username").fill("headless-passkey");
    await page.getByRole("button", { name: "Login with Passkey" }).click();

    await expect(
      page.getByText("Successfully authenticated with Passkey!"),
    ).toBeVisible();
  });

  test("headless metamask login", async ({ page }) => {
    await page.locator("#headless-username").fill("headless-evm");
    await page.getByRole("button", { name: "Login with MetaMask" }).click();

    await expect(
      page.getByText("Successfully authenticated with MetaMask!"),
    ).toBeVisible();
  });
});
