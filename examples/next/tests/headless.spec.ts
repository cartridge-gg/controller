import { test, expect, Page } from "@playwright/test";
import { WebauthnEmulator } from "./webauthn";

// Requires keychain running via `pnpm --filter @cartridge/keychain dev:e2e`
// and the example app pointing at that keychain entry
// (e.g. NEXT_PUBLIC_KEYCHAIN_FRAME_URL=http://localhost:3001/index.e2e.html).
const MOCK_EVM_ADDRESS = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

const waitForKeychainFrame = async (page: Page) => {
  let keychainFrame = page.frame({ url: /localhost:3001/ });
  for (let i = 0; i < 20 && !keychainFrame; i += 1) {
    await page.waitForTimeout(500);
    keychainFrame = page.frame({ url: /localhost:3001/ });
  }

  return keychainFrame;
};

test.describe("headless connect", () => {
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

    const headlessButton = page.getByRole("button", { name: "Headless" });
    await expect(headlessButton).toBeEnabled();
    await headlessButton.click();

    const client = await page.context().newCDPSession(page);
    const webauthn = new WebauthnEmulator({ client });
    await webauthn.enable();
    await webauthn.addVirtualAuthenticator();
  });

  test("headless passkey login", async ({ page }) => {
    await page.locator("#headless-username").fill("headless-passkey");
    await page.getByRole("button", { name: "Login with Passkey" }).click();

    const keychainFrame = await waitForKeychainFrame(page);
    await expect(page.locator("#controller")).toBeVisible();
    expect(keychainFrame?.url()).toContain("/connect");
  });

  test("headless metamask login", async ({ page }) => {
    await page.locator("#headless-username").fill("headless-evm");
    await page.getByRole("button", { name: "Login with MetaMask" }).click();

    const keychainFrame = await waitForKeychainFrame(page);
    await expect(page.locator("#controller")).toBeVisible();
    expect(keychainFrame?.url()).toContain("/connect");
  });
});
